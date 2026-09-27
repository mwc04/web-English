export interface Exam {
  _id: string;
  title: string;
  description: string;
  total_questions: number;
  duration_minutes: number;
  createdAt: Date;
}

export interface Question {
  _id: string;
  test_id: string;
  question_text: string;
  options_json: string[];
  correct_answer: string;
}

export interface ExamResult {
  _id: string;
  user_id: string;
  test_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  completed_at: Date;
}