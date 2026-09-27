export interface Lesson {
  _id: string;
  title: string;
  type: 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'writing';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  content: any;
  description?: string;
  duration?: number;
  createdAt: Date;
}