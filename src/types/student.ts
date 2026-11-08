export interface Student {
  id: number;
  name: string;
  reg_no: string;
  email: string;
  course: string;
  created_at: string;
}

export interface StudentFormData {
  name: string;
  reg_no: string;
  email: string;
  course: string;
}

export interface ValidationErrors {
  name?: string;
  reg_no?: string;
  email?: string;
  course?: string;
  general?: string;
}

export interface SQLExecutionLog {
  id: string;
  timestamp: string;
  query: string;
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'DDL';
  affectedRows?: number;
  durationMs: number;
  status: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
}

export interface ProjectFile {
  filename: string;
  path: string;
  language: 'php' | 'sql' | 'css' | 'javascript' | 'markdown';
  description: string;
  content: string;
}

export type ActiveTab = 'system' | 'database' | 'code' | 'rubric';
