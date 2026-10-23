export interface ConformanceCheckResult {
  id: string;
  name: string;
  passed: boolean;
  message: string;
  durationMs?: number;
}

export interface ConformanceReport {
  targetUrl: string;
  timestamp: string;
  totalChecks: number;
  passedChecks: number;
  results: ConformanceCheckResult[];
}

export function createEmptyReport(targetUrl: string): ConformanceReport {
  return {
    targetUrl,
    timestamp: new Date().toISOString(),
    totalChecks: 0,
    passedChecks: 0,
    results: [],
  };
}
