// ============================================================
// Offline Queue — Resilient Form Submission
// Stores pending submissions in localStorage when offline,
// auto-syncs when connectivity returns.
// ============================================================

const QUEUE_KEY = "portal_offline_queue";

export interface QueuedSubmission {
  id: string;
  data: Record<string, unknown>;
  timestamp: number;
}

// ---- Read queue ----
export function getQueue(): QueuedSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ---- Write queue ----
function saveQueue(queue: QueuedSubmission[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

// ---- Enqueue a submission ----
export function enqueueSubmission(data: Record<string, unknown>): QueuedSubmission {
  const entry: QueuedSubmission = {
    id: crypto.randomUUID(),
    data,
    timestamp: Date.now(),
  };
  const queue = getQueue();
  queue.push(entry);
  saveQueue(queue);
  return entry;
}

// ---- Remove a single item from queue ----
export function dequeueSubmission(id: string): void {
  const queue = getQueue().filter((item) => item.id !== id);
  saveQueue(queue);
}

// ---- Get pending count ----
export function getPendingCount(): number {
  return getQueue().length;
}

// ---- Process queue (call with a submit function) ----
export async function processQueue(
  submitFn: (data: Record<string, unknown>) => Promise<void>
): Promise<{ success: number; failed: number }> {
  const queue = getQueue();
  if (queue.length === 0) return { success: 0, failed: 0 };

  let success = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      await submitFn(item.data);
      dequeueSubmission(item.id);
      success++;
    } catch {
      failed++;
    }
  }

  return { success, failed };
}

// ---- Auto-sync listener (call once on app mount) ----
export function startAutoSync(
  submitFn: (data: Record<string, unknown>) => Promise<void>,
  onSynced?: (result: { success: number; failed: number }) => void
): () => void {
  const handler = async () => {
    if (!navigator.onLine) return;
    const pending = getPendingCount();
    if (pending === 0) return;

    const result = await processQueue(submitFn);
    onSynced?.(result);
  };

  window.addEventListener("online", handler);

  // Also attempt immediately if online
  if (navigator.onLine) {
    handler();
  }

  return () => window.removeEventListener("online", handler);
}
