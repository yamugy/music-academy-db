import { Student, Teacher, Class, Payment, User } from '../types/index';
import { fetchGithubFile, saveGithubFile } from './github';

// 학생 데이터 관리
export const studentAPI = {
  async getAll(): Promise<Student[]> {
    try {
      const data = await fetchGithubFile('data/students.json');
      return data.students || [];
    } catch (error) {
      console.error('학생 데이터 로딩 실패:', error);
      return [];
    }
  },

  async save(students: Student[]) {
    try {
      return await saveGithubFile('data/students.json', { students });
    } catch (error) {
      console.error('학생 데이터 저장 실패:', error);
      throw error;
    }
  }
};

// 선생님 데이터 관리
export const teacherAPI = {
  async getAll(): Promise<Teacher[]> {
    try {
      const data = await fetchGithubFile('data/teachers.json');
      return data.teachers || [];
    } catch (error) {
      console.error('선생님 데이터 로딩 실패:', error);
      return [];
    }
  },

  async save(teachers: Teacher[]) {
    try {
      return await saveGithubFile('data/teachers.json', { teachers });
    } catch (error) {
      console.error('선생님 데이터 저장 실패:', error);
      throw error;
    }
  }
};

// 수업 데이터 관리
export const classAPI = {
  async getAll(): Promise<Class[]> {
    try {
      const data = await fetchGithubFile('data/classes.json');
      return data.classes || [];
    } catch (error) {
      console.error('수업 데이터 로딩 실패:', error);
      return [];
    }
  },

  async save(classes: Class[]) {
    try {
      return await saveGithubFile('data/classes.json', { classes });
    } catch (error) {
      console.error('수업 데이터 저장 실패:', error);
      throw error;
    }
  }
};

// 결제 데이터 관리
export const paymentAPI = {
  async getAll(): Promise<Payment[]> {
    try {
      const data = await fetchGithubFile('data/payments.json');
      return data.payments || [];
    } catch (error) {
      console.error('결제 데이터 로딩 실패:', error);
      return [];
    }
  },

  async save(payments: Payment[]) {
    try {
      return await saveGithubFile('data/payments.json', { payments });
    } catch (error) {
      console.error('결제 데이터 저장 실패:', error);
      throw error;
    }
  }
};

// 임시 로컬 사용자 데이터 타입 정의
interface LocalUser {
  id: number;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'teacher';
}

// 임시 로컬 사용자 데이터
const localUsers = {
  users: [
    {
      id: 1,
      username: "sogon",
      password: "sogonsogon",
      name: "관리자",
      role: "admin" as const
    },
    {
      id: 2,
      username: "teacher1",
      password: "1234",
      name: "박선생",
      role: "teacher" as const
    }
  ] as LocalUser[]
};

export const userAPI = {
  async login(username: string, password: string): Promise<User | null> {
    try {
      const data = localUsers;
      console.log('로그인 시도 - 입력된 정보:', { username, password });
      console.log('사용자 데이터:', data);

      if (!data || !data.users) {
        console.error('사용자 데이터가 없습니다');
        return null;
      }

      const user = data.users.find(
        (u) => u.username === username && u.password === password
      );
      
      console.log('찾은 사용자:', user);
      
      if (user) {
        // 비밀번호는 저장하지 않음
        const { password: _, ...safeUser } = user;
        return safeUser as User;
      }
      
      return null;
    } catch (error) {
      console.error('로그인 실패:', error);
      return null;
    }
  }
};