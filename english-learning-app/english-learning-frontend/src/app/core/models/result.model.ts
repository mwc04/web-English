export interface Result {
  _id: string;
  user_id: string;
  test_id: {
    _id: string;
    title: string;
    description: string;
  };
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  completed_at: Date;
}

export interface ResultStatistics {
  total_tests: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  total_questions_answered: number;
  total_correct_answers: number;
  accuracy_rate: number;
  recent_results: Result[];
}