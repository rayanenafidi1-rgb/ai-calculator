
export type CalculatorMode = 'standard' | 'scientific' | 'ai-solver';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface AISolution {
  problem: string;
  steps: string[];
  finalAnswer: string;
  explanation: string;
}
