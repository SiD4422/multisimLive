const STORAGE_KEY = 'nodesim_labreport_usage';

interface UsageData {
  count: number;
  monthKey: string;
}

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getLabReportUsage(): UsageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, monthKey: getCurrentMonthKey() };
    const data = JSON.parse(raw) as UsageData;
    if (data.monthKey !== getCurrentMonthKey()) return { count: 0, monthKey: getCurrentMonthKey() };
    return data;
  } catch {
    return { count: 0, monthKey: getCurrentMonthKey() };
  }
}

export function incrementLabReportUsage(): void {
  const current = getLabReportUsage();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: current.count + 1, monthKey: getCurrentMonthKey() }));
}

export const FREE_REPORT_LIMIT = 3;
export function isLabReportLimitReached(): boolean {
  return getLabReportUsage().count >= FREE_REPORT_LIMIT;
}
export function getLabReportRemainingCount(): number {
  return Math.max(0, FREE_REPORT_LIMIT - getLabReportUsage().count);
}
