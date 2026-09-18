/**
 * Privacy-First Local Metrics Tracker
 * Strictly local storage only. No external telemetry or document data is ever transmitted.
 */

interface LocalStats {
  totalProcessed: number;
  passportPhotosCreated: number;
  idCardsMerged: number;
  pdfsGenerated: number;
  scansCompleted: number;
  batchItemsProcessed: number;
  lastActive: string;
}

const STORAGE_KEY = 'nexora_local_stats_v1';

export function getLocalStats(): LocalStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading stats:', e);
  }

  return {
    totalProcessed: 142, // seeded default for initial display
    passportPhotosCreated: 58,
    idCardsMerged: 42,
    pdfsGenerated: 26,
    scansCompleted: 16,
    batchItemsProcessed: 0,
    lastActive: new Date().toISOString(),
  };
}

export function incrementStat(
  type: 'passport' | 'idMerger' | 'pdf' | 'scanner' | 'batch',
  count = 1
) {
  const current = getLocalStats();
  current.totalProcessed += count;
  if (type === 'passport') current.passportPhotosCreated += count;
  if (type === 'idMerger') current.idCardsMerged += count;
  if (type === 'pdf') current.pdfsGenerated += count;
  if (type === 'scanner') current.scansCompleted += count;
  if (type === 'batch') current.batchItemsProcessed += count;
  current.lastActive = new Date().toISOString();

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Error writing stats:', e);
  }
}
