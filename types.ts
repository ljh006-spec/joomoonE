export enum RecordStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface StudentRecord {
  id: string;
  name: string;
  category: string;
  keywords: string;
  targetLength: number;
  generatedContent: string;
  status: RecordStatus;
  lastUpdated: number;
}

export enum EvaluationTone {
  DESCRIPTIVE = 'descriptive', // ~함, ~임 (noun ending)
  FORMAL = 'formal', // ~합니다, ~습니다 (polite)
}