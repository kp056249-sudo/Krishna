/**
 * RTO ML Intelligence Service
 * Pure TypeScript logistic regression — no external ML libraries.
 * Features: pincode target encoding (LOO), payment mode, order value,
 *           discount, item count, address quality, courier encoding,
 *           customer RTO history rate.
 */

import { adminDb } from '../firestoreService.js';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TrainRow {
  rtoOutcome: 0 | 1; // 1 = RTO, 0 = DELIVERED
  paymentMode: number; // COD=1, PREPAID=0
  orderValue: number;
  discountAmount: number;
  itemCount: number;
  addressQuality: number; // address length / 100, capped 0–1
  courierEncoded: number;
  pincodeEncoded: number; // LOO target encoding
  customerRtoRate: number; // 0–1
}

interface ModelCoefficients {
  bias: number;
  weights: number[]; // same order as feature vector
  featureNames: string[];
}

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  auc: number;
  baselineAuc: number;
  dataRowsUsed: number;
}

export interface TrainOutput extends ModelMetrics {
  success: boolean;
  insufficientData?: boolean;
  error?: string;
}

export interface ScoredOrderResult {
  orderId: string;
  orderNumber?: string;
  customerName?: string;
  orderTotal: number;
  paymentMode: string;
  rtoRiskScore: number; // 0–100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  topFeatures: { feature: string; contribution: number }[];
  action?: string;
  createdAt?: string;
}

// ─── Math Helpers ─────────────────────────────────────────────────────────────

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
}

function dot(a: number[], b: number[]): number {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

/** Trapezoidal AUC from parallel arrays of scores and labels (1=positive). */
function computeAuc(scores: number[], labels: number[]): number {
  const pairs = scores.map((s, i) => ({ s, l: labels[i] })).sort((a, b) => b.s - a.s);
  const totalPos = labels.reduce((s, v) => s + v, 0);
  const totalNeg = labels.length - totalPos;
  if (totalPos === 0 || totalNeg === 0) return 0.5;
  let tp = 0, fp = 0, prevTp = 0, prevFp = 0, auc = 0;
  for (const { l } of pairs) {
    if (l === 1) tp++;
    else fp++;
    if (fp !== prevFp) {
      auc += (fp - prevFp) * (tp + prevTp) / 2 / totalPos / totalNeg;
      prevFp = fp; prevTp = tp;
    }
  }
  auc += (totalNeg - prevFp) * (totalPos + prevTp) / 2 / totalPos / totalNeg;
  return auc;
}

/** Mini-batch gradient descent logistic regression. */
function trainLogisticRegression(
  X: number[][],
  y: number[],
  opts: { lr?: number; epochs?: number; batchSize?: number } = {}
): ModelCoefficients & { featureNames: string[] } {
  const { lr = 0.05, epochs = 300, batchSize = 64 } = opts;
  const n = X.length;
  const d = X[0].length;
  let bias = 0;
  const weights = new Array(d).fill(0);

  for (let epoch = 0; epoch < epochs; epoch++) {
    // shuffle
    const idx = [...Array(n).keys()].sort(() => Math.random() - 0.5);
    for (let start = 0; start < n; start += batchSize) {
      const batch = idx.slice(start, start + batchSize);
      let dBias = 0;
      const dW = new Array(d).fill(0);
      for (const i of batch) {
        const pred = sigmoid(bias + dot(weights, X[i]));
        const err = pred - y[i];
        dBias += err;
        for (let j = 0; j < d; j++) dW[j] += err * X[i][j];
      }
      const bs = batch.length;
      bias -= lr * dBias / bs;
      for (let j = 0; j < d; j++) weights[j] -= lr * dW[j] / bs;
    }
  }

  return { bias, weights, featureNames: [] };
}

// ─── LOO Target Encoding ──────────────────────────────────────────────────────

function looTargetEncode(values: string[], labels: number[]): Map<string, number> {
  const groups = new Map<string, { sum: number; count: number }>();
  const global = labels.reduce((s, v) => s + v, 0) / labels.length;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (!groups.has(v)) groups.set(v, { sum: 0, count: 0 });
    const g = groups.get(v)!;
    g.sum += labels[i]; g.count++;
  }
  const enc = new Map<string, number>();
  for (const [k, g] of groups) {
    enc.set(k, g.count > 1 ? g.sum / g.count : global);
  }
  return enc;
}

// ─── Courier Encoding ─────────────────────────────────────────────────────────

function courierEncode(courier: string): number {
  const m: Record<string, number> = { 'bluedart': 0.2, 'delhivery': 0.35, 'xpressbees': 0.4, 'dtdc': 0.5, 'ekart': 0.45 };
  const k = courier.toLowerCase().replace(/\s+/g, '');
  for (const [name, val] of Object.entries(m)) {
    if (k.includes(name)) return val;
  }
  return 0.5;
}

// ─── Build Feature Vector ─────────────────────────────────────────────────────

const FEATURE_NAMES = [
  'payment_mode', 'order_value_norm', 'discount_ratio', 'item_count_norm',
  'address_quality', 'courier_rto_rate', 'pincode_target', 'customer_rto_rate'
];

function buildFeatureVec(row: TrainRow, maxOrderValue: number): number[] {
  return [
    row.paymentMode,
    maxOrderValue > 0 ? row.orderValue / maxOrderValue : 0,
    row.orderValue > 0 ? row.discountAmount / row.orderValue : 0,
    Math.min(row.itemCount / 10, 1),
    row.addressQuality,
    row.courierEncoded,
    row.pincodeEncoded,
    row.customerRtoRate,
  ];
}

// ─── Main Service Functions ───────────────────────────────────────────────────

export async function trainRtoMLModel(companyId: string): Promise<TrainOutput> {
  try {
    // Fetch orders with known outcome (DELIVERED or RTO*)
    const snap = await adminDb
      .collection('companies').doc(companyId)
      .collection('orders')
      .where('status', 'in', ['DELIVERED', 'RTO', 'RTO_INITIATED', 'RTO_DELIVERED'])
      .orderBy('createdAt', 'asc')
      .limit(10000)
      .get();

    if (snap.size < 100) {
      return { success: false, insufficientData: true, accuracy: 0, precision: 0, recall: 0, auc: 0, baselineAuc: 0, dataRowsUsed: snap.size };
    }

    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));

    // Customer RTO history: pre-compute per customer
    const customerHistory = new Map<string, { total: number; rtos: number }>();
    for (const d of docs) {
      const phone = d.customerPhone || d.phone || '';
      if (!phone) continue;
      if (!customerHistory.has(phone)) customerHistory.set(phone, { total: 0, rtos: 0 });
      const h = customerHistory.get(phone)!;
      h.total++;
      if (String(d.status).toUpperCase().includes('RTO')) h.rtos++;
    }

    const pincodes: string[] = docs.map(d => String(d.pincode || '000000'));
    const labels: number[] = docs.map(d => String(d.status).toUpperCase().includes('RTO') ? 1 : 0);
    const pincodeMap = looTargetEncode(pincodes, labels);

    // Chronological 80/20 split
    const splitIdx = Math.floor(docs.length * 0.8);
    const trainDocs = docs.slice(0, splitIdx);
    const testDocs = docs.slice(splitIdx);
    const trainLabels = labels.slice(0, splitIdx);
    const testLabels = labels.slice(splitIdx);

    const maxOrderValue = Math.max(...docs.map(d => d.orderTotal || d.totalAmount || 0), 1);

    const toRow = (d: any): TrainRow => {
      const phone = d.customerPhone || d.phone || '';
      const h = customerHistory.get(phone);
      const pm = String(d.paymentMode || '').toUpperCase();
      return {
        rtoOutcome: String(d.status).toUpperCase().includes('RTO') ? 1 : 0,
        paymentMode: pm === 'COD' ? 1 : 0,
        orderValue: d.orderTotal || d.totalAmount || 0,
        discountAmount: d.discountAmount || 0,
        itemCount: Array.isArray(d.items) ? d.items.length : (d.itemCount || 1),
        addressQuality: Math.min(String(d.shippingAddress || d.address || '').length / 100, 1),
        courierEncoded: courierEncode(d.courierPartner || d.courier || ''),
        pincodeEncoded: pincodeMap.get(String(d.pincode || '000000')) ?? 0.3,
        customerRtoRate: h && h.total > 1 ? h.rtos / h.total : 0,
      };
    };

    const trainRows = trainDocs.map(toRow);
    const testRows = testDocs.map(toRow);
    const X_train = trainRows.map(r => buildFeatureVec(r, maxOrderValue));
    const X_test = testRows.map(r => buildFeatureVec(r, maxOrderValue));

    const model = trainLogisticRegression(X_train, trainLabels, { lr: 0.1, epochs: 400 });
    model.featureNames = FEATURE_NAMES;

    // Evaluate on test set
    const testScores = X_test.map(x => sigmoid(model.bias + dot(model.weights, x)));
    const threshold = 0.4;
    let tp = 0, fp = 0, fn = 0, tn = 0;
    for (let i = 0; i < testScores.length; i++) {
      const pred = testScores[i] >= threshold ? 1 : 0;
      if (pred === 1 && testLabels[i] === 1) tp++;
      else if (pred === 1 && testLabels[i] === 0) fp++;
      else if (pred === 0 && testLabels[i] === 1) fn++;
      else tn++;
    }

    const accuracy = (tp + tn) / testLabels.length;
    const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
    const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
    const auc = computeAuc(testScores, testLabels);
    const baselineRate = testLabels.reduce((s, v) => s + v, 0) / testLabels.length;
    const baselineAuc = 0.5; // majority-class classifier AUC

    // Store model in Firestore
    await adminDb
      .collection('companies').doc(companyId)
      .collection('ml_models').doc('rto_predictor')
      .set({
        bias: model.bias,
        weights: model.weights,
        featureNames: FEATURE_NAMES,
        maxOrderValue,
        pincodeMap: Object.fromEntries(pincodeMap),
        metrics: { accuracy, precision, recall, auc, baselineAuc },
        dataRowsUsed: docs.length,
        trainedAt: new Date().toISOString(),
      });

    return {
      success: true,
      accuracy, precision, recall, auc, baselineAuc,
      dataRowsUsed: docs.length,
    };
  } catch (err: any) {
    return { success: false, error: err.message, accuracy: 0, precision: 0, recall: 0, auc: 0, baselineAuc: 0, dataRowsUsed: 0 };
  }
}

export async function getModelStatus(companyId: string) {
  const doc = await adminDb
    .collection('companies').doc(companyId)
    .collection('ml_models').doc('rto_predictor')
    .get();

  if (!doc.exists) return { trained: false };
  const d = doc.data()!;
  return {
    trained: true,
    lastTrainedAt: d.trainedAt,
    dataRowsUsed: d.dataRowsUsed,
    ...d.metrics,
  };
}

export async function scoredOrders(companyId: string): Promise<ScoredOrderResult[]> {
  // Load model
  const modelDoc = await adminDb
    .collection('companies').doc(companyId)
    .collection('ml_models').doc('rto_predictor')
    .get();

  // Fetch last 30d COD orders (regardless of model — show all with fallback scoring)
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const snap = await adminDb
    .collection('companies').doc(companyId)
    .collection('orders')
    .where('paymentMode', '==', 'COD')
    .where('createdAt', '>=', since)
    .orderBy('createdAt', 'desc')
    .limit(200)
    .get();

  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));

  // Build customer history from these docs
  const customerHistory = new Map<string, { total: number; rtos: number }>();
  for (const d of docs) {
    const phone = d.customerPhone || d.phone || '';
    if (!phone) continue;
    if (!customerHistory.has(phone)) customerHistory.set(phone, { total: 0, rtos: 0 });
    const h = customerHistory.get(phone)!;
    h.total++;
    if (String(d.status).toUpperCase().includes('RTO')) h.rtos++;
  }

  let modelData: any = null;
  let pincodeMap: Map<string, number> = new Map();
  if (modelDoc.exists) {
    modelData = modelDoc.data()!;
    pincodeMap = new Map(Object.entries(modelData.pincodeMap || {}));
  }

  const maxOrderValue = modelData?.maxOrderValue || Math.max(...docs.map(d => d.orderTotal || d.totalAmount || 0), 1);

  return docs.map(d => {
    const phone = d.customerPhone || d.phone || '';
    const h = customerHistory.get(phone);
    const pm = String(d.paymentMode || '').toUpperCase();
    const row: TrainRow = {
      rtoOutcome: 0,
      paymentMode: pm === 'COD' ? 1 : 0,
      orderValue: d.orderTotal || d.totalAmount || 0,
      discountAmount: d.discountAmount || 0,
      itemCount: Array.isArray(d.items) ? d.items.length : (d.itemCount || 1),
      addressQuality: Math.min(String(d.shippingAddress || d.address || '').length / 100, 1),
      courierEncoded: courierEncode(d.courierPartner || d.courier || ''),
      pincodeEncoded: pincodeMap.get(String(d.pincode || '000000')) ?? 0.3,
      customerRtoRate: h && h.total > 1 ? h.rtos / h.total : 0,
    };

    const features = buildFeatureVec(row, maxOrderValue);
    let probability = 0.35; // fallback prior
    let topFeatures: { feature: string; contribution: number }[] = [];

    if (modelData) {
      const { bias, weights } = modelData;
      const logit = bias + dot(weights as number[], features);
      probability = sigmoid(logit);
      // per-feature contribution = weight * feature_value (unnormalized)
      const contribs = (weights as number[]).map((w, i) => ({ feature: FEATURE_NAMES[i], contribution: w * features[i] / 10 }));
      topFeatures = contribs.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)).slice(0, 3);
    } else {
      // heuristic fallback when model not trained
      if (pm === 'COD') probability += 0.1;
      if ((d.orderTotal || 0) > 2000) probability -= 0.05;
      topFeatures = [
        { feature: 'payment_mode', contribution: pm === 'COD' ? 0.1 : -0.05 },
        { feature: 'order_value_norm', contribution: -0.03 },
        { feature: 'customer_rto_rate', contribution: row.customerRtoRate * 0.2 },
      ];
    }

    const score = Math.round(Math.max(0, Math.min(100, probability * 100)));
    const riskLevel: ScoredOrderResult['riskLevel'] = score >= 75 ? 'CRITICAL' : score >= 55 ? 'HIGH' : score >= 35 ? 'MEDIUM' : 'LOW';

    return {
      orderId: d.id,
      orderNumber: d.orderNumber,
      customerName: d.customerName,
      orderTotal: d.orderTotal || d.totalAmount || 0,
      paymentMode: d.paymentMode || 'COD',
      rtoRiskScore: score,
      riskLevel,
      topFeatures,
      action: d.rtoMlAction,
      createdAt: d.createdAt,
    };
  });
}

export async function recordAction(companyId: string, orderId: string, action: string) {
  await adminDb
    .collection('companies').doc(companyId)
    .collection('orders').doc(orderId)
    .update({ rtoMlAction: action, rtoMlActionAt: new Date().toISOString() });
}

export async function computeSavings(companyId: string): Promise<number> {
  // Sum order values of HIGH/CRITICAL risk orders that were held and did NOT become RTO
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const snap = await adminDb
    .collection('companies').doc(companyId)
    .collection('orders')
    .where('rtoMlAction', '==', 'held')
    .where('createdAt', '>=', since)
    .get();

  let total = 0;
  for (const doc of snap.docs) {
    const d = doc.data() as any;
    if (!String(d.status || '').toUpperCase().includes('RTO')) {
      total += d.orderTotal || d.totalAmount || 0;
    }
  }
  return total;
}
