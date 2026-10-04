import { adminDb } from '../firestoreService';

export interface StreamLogEntry {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  type: 'info' | 'success' | 'warn' | 'action';
  status: string;
  executionId?: string;
}

export interface DirectiveExecutionRecord {
  id: string;
  directiveName: string;
  prompt: string;
  status: 'QUEUED' | 'RUNNING' | 'WAITING_APPROVAL' | 'COMPLETED' | 'FAILED' | 'PARTIAL' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  dataSourcesUsed: string[];
  aiAnalysis: any;
  calculations: any;
  actionsTaken: string[];
  confidenceScore: number;
  executionId: string;
  auditLogId: string;
}

export interface AutonomousSettings {
  autonomousMode: boolean;
  rtoThreshold: number; // e.g. 15 (%)
  roasThreshold: number; // e.g. 2.2 (x)
  stockoutLeadTimeDays: number; // e.g. 14 days
  whatsappRecipientPhone: string;
  whatsappDailyReportTime: string; // "08:00"
  whatsappDailyReportEnabled: boolean;
  actionPermissions: Record<string, 'READ' | 'RECOMMEND' | 'APPROVE' | 'EXECUTE'>;
}

// In-memory stream buffer for instant sub-5ms UI responsiveness
const streamLogsMemory: StreamLogEntry[] = [];

const directiveExecutionsMemory: DirectiveExecutionRecord[] = [];

let currentSettings: AutonomousSettings = {
  autonomousMode: false,
  rtoThreshold: 15.0,
  roasThreshold: 2.2,
  stockoutLeadTimeDays: 14,
  whatsappRecipientPhone: '',
  whatsappDailyReportTime: '08:00',
  whatsappDailyReportEnabled: false,
  actionPermissions: {}
};

/**
 * Log a new event into the Live Agent Terminal Stream
 */
export function pushAgentStreamLog(
  agent: string,
  action: string,
  type: 'info' | 'success' | 'warn' | 'action' = 'info',
  status: string = 'SUCCESS',
  executionId?: string
): StreamLogEntry {
  const entry: StreamLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString('en-IN'),
    agent,
    action,
    type,
    status,
    executionId: executionId || `exec_${Date.now()}`
  };

  streamLogsMemory.push(entry);
  if (streamLogsMemory.length > 100) {
    streamLogsMemory.shift();
  }

  // Persist to Firestore asynchronously
  try {
    adminDb.collection('agent_stream_logs').doc(entry.id).set({
      ...entry,
      createdAt: new Date().toISOString()
    }).catch(() => {});
  } catch (e) {}

  return entry;
}

/**
 * Record a Directive Execution into history
 */
export function recordDirectiveExecution(record: Omit<DirectiveExecutionRecord, 'id'>): DirectiveExecutionRecord {
  const fullRecord: DirectiveExecutionRecord = {
    ...record,
    id: `exec_rec_${Date.now()}`
  };

  directiveExecutionsMemory.unshift(fullRecord);

  try {
    adminDb.collection('directive_executions').doc(fullRecord.id).set({
      ...fullRecord,
      createdAt: new Date().toISOString()
    }).catch(() => {});
  } catch (e) {}

  return fullRecord;
}

export function getStreamLogs(): StreamLogEntry[] {
  return [...streamLogsMemory];
}

export function getDirectiveHistory(): DirectiveExecutionRecord[] {
  return [...directiveExecutionsMemory];
}

export function getAutonomousSettings(): AutonomousSettings {
  return { ...currentSettings };
}

export function updateAutonomousSettings(newSettings: Partial<AutonomousSettings>): AutonomousSettings {
  currentSettings = { ...currentSettings, ...newSettings };
  return currentSettings;
}
