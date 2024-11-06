export interface Student {
  id: number;
  name: string;
  instrument: string;
  phone: string;
}

export interface Teacher {
  id: number;
  name: string;
  instrument: string;
  phone: string;
  bankAccount: string;
}

export interface Class {
  id: number;
  date: string;
  dayOfWeek: string;
  time: string;
  studentId: number;
  teacherId: number;
  instrument: string;
  duration: string;
  content: string;
}

export interface Payment {
  id: number;
  date: string;
  studentId: number;
  amount: number;
  method: string;
  status: string;
  memo: string;
} 