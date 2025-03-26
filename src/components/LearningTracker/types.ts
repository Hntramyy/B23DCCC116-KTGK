export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  date: string;
  duration: number; // in minutes
  content: string;
  notes?: string;
}

export interface MonthlyGoal {
  id: string;
  subjectId: string;
  month: string; // YYYY-MM format
  targetHours: number;
  completed: boolean;
}

export interface StorageData {
  subjects: Subject[];
  studySessions: StudySession[];
  monthlyGoals: MonthlyGoal[];
}

export const STORAGE_KEY = 'learning_tracker_data';

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: 'Toán', color: '#ff4d4f' },
  { id: '2', name: 'Văn', color: '#52c41a' },
  { id: '3', name: 'Anh', color: '#1890ff' },
  { id: '4', name: 'Khoa học', color: '#722ed1' },
  { id: '5', name: 'Công nghệ', color: '#faad14' },
];

export const PREDEFINED_COLORS = [
  '#ff4d4f', // Red
  '#52c41a', // Green
  '#1890ff', // Blue
  '#722ed1', // Purple
  '#faad14', // Yellow
  '#13c2c2', // Cyan
  '#eb2f96', // Pink
  '#fa8c16', // Orange
  '#a0d911', // Lime
  '#2f54eb', // Geekblue
];
