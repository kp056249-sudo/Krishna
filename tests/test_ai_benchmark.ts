import 'dotenv/config';
import { processChatbotMessage } from '../server/services/chatbotService.js';

interface BenchmarkResult {
  id: number;
  question: string;
  category: string;
  reply: string;
  responseTimeMs: number;
  modelUsed: string;
  keyUsed: number;
  cached: boolean;
  groundedCorrectly: boolean;
}

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    category: 'P&L & Financials',
    question: 'Aapke store ka total GMV aur realized profit margin kitna hai?',
    expectedKeywords: ['₹1.45', '28.4%']
  },
  {
    id: 2,
    category: 'Orders & Fulfillment',
    question: 'Store ne kitne orders process kiye hain aur delivery rate kya hai?',
    expectedKeywords: ['10,000', '8,570', '85.7%']
  },
  {
    id: 3,
    category: 'Ad Spend & ROAS',
    question: 'Meta aur Google Ads ka total ad spend aur blended ROAS kya chal raha hai?',
    expectedKeywords: ['₹34,50,000', '4.2x']
  },
  {
    id: 4,
    category: 'RTO & Logistics Drag',
    question: 'Current RTO return rate kitna hai aur per return penalty kitni hai?',
    expectedKeywords: ['14.3%', '₹210']
  },
  {
    id: 5,
    category: 'Inventory & Stockouts',
    question: 'Catalog me kitne active SKUs hain aur low stock runway alerts kitne hain?',
    expectedKeywords: ['142', '3']
  },
  {
    id: 6,
    category: 'WhatsApp 8 AM Briefing',
    question: 'WhatsApp 8:00 AM briefing kis number par send hoti hai aur usme kya hota hai?',
    expectedKeywords: ['919250509070', '8:00 AM']
  },
  {
    id: 7,
    category: 'Courier Intelligence',
    question: 'BlueDart aur Delhivery courier partners ka on-time delivery SLA kya hai?',
    expectedKeywords: ['BlueDart', '94.2%', 'Delhivery']
  },
  {
    id: 8,
    category: 'Store Integrations',
    question: 'Shopify aur WooCommerce store connect karne ke liye kya zaroorat hoti hai?',
    expectedKeywords: ['Shopify', 'token']
  },
  {
    id: 9,
    category: 'Data Grounding & Boundary (Data Unavailable)',
    question: 'Hamare TikTok shop aur Flipkart store ki kal ki sales kitni thi?',
    expectedKeywords: ['available nahi']
  },
  {
    id: 10,
    category: 'Cache Verification (Repeat Question 1)',
    question: 'Aapke store ka total GMV aur realized profit margin kitna hai?',
    expectedKeywords: ['₹1.45']
  },
  {
    id: 11,
    category: 'General Coding & Tech',
    question: 'Write Python code to reverse a list in 2 lines',
    expectedKeywords: ['reverse', 'list']
  },
  {
    id: 12,
    category: 'General Science & Knowledge',
    question: 'What is photosynthesis? Explain in 2 lines',
    expectedKeywords: ['plant', 'light', 'energy', 'sunlight', 'process']
  }
];

async function runBenchmark() {
  console.log('================================================================');
  console.log('DATANEXUS HIGH-PERFORMANCE AI BENCHMARK (10 SAMPLE QUESTIONS)');
  console.log('Speed Target: < 5,000ms | Cache Target: < 10ms | Grounding: Strict');
  console.log('================================================================\n');

  const results: BenchmarkResult[] = [];

  for (const item of SAMPLE_QUESTIONS) {
    console.log(`[Test #${item.id}] Category: ${item.category}`);
    console.log(`Question: "${item.question}"`);

    const result = await processChatbotMessage(item.question);

    const matchesExpected = item.expectedKeywords.some(kw =>
      result.reply.toLowerCase().includes(kw.toLowerCase())
    );

    console.log(`Response Time: ${result.responseTimeMs} ms | Cached: ${result.cached} | Model: ${result.modelUsed} | Key #${result.keyUsed}`);
    console.log(`Answer:\n${result.reply}`);
    console.log(`Grounded Check: ${matchesExpected ? '✓ PASS' : '⚠️ REVIEW'}\n`);
    console.log('----------------------------------------------------------------');

    results.push({
      id: item.id,
      question: item.question,
      category: item.category,
      reply: result.reply,
      responseTimeMs: result.responseTimeMs,
      modelUsed: result.modelUsed,
      keyUsed: result.keyUsed,
      cached: result.cached,
      groundedCorrectly: matchesExpected
    });
  }

  console.log('\n================================================================');
  console.log('BENCHMARK SUMMARY REPORT');
  console.log('================================================================');
  console.table(results.map(r => ({
    '#': r.id,
    'Category': r.category,
    'Latency (ms)': r.responseTimeMs,
    'Target (<5s)': r.responseTimeMs < 5000 ? '✓ PASS' : '✗ FAIL',
    'Cached': r.cached ? 'YES' : 'NO',
    'Model': r.modelUsed,
    'Grounded': r.groundedCorrectly ? '✓ YES' : 'REVIEW'
  })));

  const avgLatency = Math.round(results.reduce((s, r) => s + r.responseTimeMs, 0) / results.length);
  const maxLatency = Math.max(...results.map(r => r.responseTimeMs));
  const sub5SecCount = results.filter(r => r.responseTimeMs < 5000).length;

  console.log(`Total Questions: ${results.length}`);
  console.log(`Under 5 Seconds: ${sub5SecCount}/${results.length} (${Math.round((sub5SecCount/results.length)*100)}%)`);
  console.log(`Average Latency: ${avgLatency} ms`);
  console.log(`Peak Latency: ${maxLatency} ms`);
  console.log(`Cache Latency: ${results.find(r => r.cached)?.responseTimeMs || 0} ms`);
}

runBenchmark().catch(console.error);
