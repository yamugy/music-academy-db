'use client';
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { studentAPI, teacherAPI, classAPI, paymentAPI } from '@/utils/data';
import { Student, Teacher, Class, Payment } from '@/types';

const Home: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    monthlyRevenue: 0
  });
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [todayClasses, setTodayClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [students, teachers, classes, payments] = await Promise.all([
          studentAPI.getAll(),
          teacherAPI.getAll(),
          classAPI.getAll(),
          paymentAPI.getAll()
        ]);

        setStudents(students);

        // 이번 달 수입 계산
        const currentMonth = new Date().getMonth() + 1;
        const monthlyPayments = payments.filter(payment => {
          const paymentMonth = new Date(payment.date).getMonth() + 1;
          return paymentMonth === currentMonth;
        });
        const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);

        // 오늘 수업 필터링
        const today = new Date().toISOString().split('T')[0];
        const todayClassList = classes.filter(cls => cls.date === today);

        setStats({
          totalStudents: students.length,
          totalTeachers: teachers.length,
          totalClasses: classes.length,
          monthlyRevenue
        });

        setRecentPayments(payments.slice(-5).reverse());
        setTodayClasses(todayClassList);
        setIsLoading(false);
      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : '알 수 없음';
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
    router.refresh();
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">로딩 중...</div>
    </div>;
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">음악학원 관리 시스템</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          로그아웃
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">전체 학생 수</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}명</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">전체 선생님 수</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalTeachers}명</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">전체 수업 수</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalClasses}개</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">이번 달 수입</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.monthlyRevenue.toLocaleString()}원</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 오늘의 수업 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">오늘의 수업</h2>
          {todayClasses.length > 0 ? (
            <div className="space-y-3">
              {todayClasses.map(cls => (
                <div key={cls.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{cls.time}</p>
                    <p className="text-sm text-gray-600">{cls.instrument}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{cls.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">오늘 예정된 수업이 없습니다.</p>
          )}
        </div>

        {/* 최근 결제 내역 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">최근 결제 내역</h2>
          {recentPayments.length > 0 ? (
            <div className="space-y-3">
              {recentPayments.map(payment => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{payment.date}</p>
                    <p className="text-sm text-gray-600">{getStudentName(payment.studentId)}</p>
                    <p className="text-sm text-gray-500">{payment.memo}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{payment.amount.toLocaleString()}원</p>
                    <p className="text-sm text-gray-600">{payment.method}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">최근 결제 내역이 없습니다.</p>
          )}
        </div>
      </div>
      
      {/* 메뉴 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/students" 
          className="p-6 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
          <h2 className="text-2xl font-bold text-blue-900">학생 관리</h2>
          <p className="text-blue-700">학생 목록 및 관리</p>
        </Link>
        
        <Link href="/classes" 
          className="p-6 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors">
          <h2 className="text-2xl font-bold text-purple-900">수업 관리</h2>
          <p className="text-purple-700">수업 일정 및 시간표 관리</p>
        </Link>
        
        <Link href="/teachers" 
          className="p-6 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
          <h2 className="text-2xl font-bold text-green-900">선생님 관리</h2>
          <p className="text-green-700">선생님 목록 및 관리</p>
        </Link>
        
        <Link href="/payments" 
          className="p-6 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors">
          <h2 className="text-2xl font-bold text-yellow-900">결제 관리</h2>
          <p className="text-yellow-700">수강료 결제 및 관리</p>
        </Link>
      </div>
    </main>
  );
};

export default Home;