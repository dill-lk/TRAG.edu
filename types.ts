
export interface Grade {
  id: string;
  name: string;
  sinhalaName?: string;
  colorFrom: string;
  colorTo: string;
}

export enum ExamCategory {
  AL = 'Advanced Level',
  OL = 'Ordinary Level',
  SCHOLARSHIP = 'Grade 5 Scholarship',
  OTHER = 'Other'
}

export interface Subject {
  id: string;
  name: string;
  sinhalaName: string;
  tamilName?: string;
  group: string;
  category?: ExamCategory;
}

export type ResourceType = 'Past Paper' | 'Term Test' | 'Short Note' | 'Model Paper' | 'Syllabus' | 'Teachers Guide';

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  gradeId: string;
  subjectId: string;
  term?: '1st Term' | '2nd Term' | '3rd Term';
  year?: number;
  medium: 'Sinhala' | 'English' | 'Tamil';
  description?: string;
  province?: string;
  file_url?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string; 
  isError?: boolean;
}

export interface ExamCountdown {
  title: string;
  date: Date;
}
