'use client';
import { useState, useEffect } from 'react';
import { Class, Student, Teacher } from '@/types';
import { classAPI, studentAPI, teacherAPI } from '@/utils/data';
import Link from 'next/link';

const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [newClass, setNewClass] = useState({
    date: '',
    dayOfWeek: '',
    time: '',
    studentId: 0,
    teacherId: 0,
    instrument: '',
    duration: '',
    content: ''
  });

  // 수업 시간 옵션 배열 추가
  const durationOptions = [
    '30분',
    '40분',
    '50분',
    '60분',
    '90분',
    '120분'
  ];

  // 데이터 불러오기
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [classesData, studentsData, teachersData] = await Promise.all([
        classAPI.getAll(),
        studentAPI.getAll(),
        teacherAPI.getAll()
      ]);
      setClasses(classesData);
      setStudents(studentsData);
      setTeachers(teachersData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('데이터 로딩 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 수업 추가 함수
  const handleAddClass = async () => {
    try {
      if (!newClass.date || !newClass.time || !newClass.studentId || !newClass.teacherId) {
        alert('필수 필드를 모두 입력해주세요.');
        return;
      }

      const newId = Math.max(0, ...classes.map(c => c.id)) + 1;
      const classWithId = { ...newClass, id: newId };
      
      const updatedClasses = [...classes, classWithId];
      await classAPI.save(updatedClasses);
      
      setClasses(updatedClasses);
      setIsModalOpen(false);
      setNewClass({
        date: '',
        dayOfWeek: '',
        time: '',
        studentId: 0,
        teacherId: 0,
        instrument: '',
        duration: '',
        content: ''
      });
    } catch (err) {
      setError('수업 추가에 실패했습니다.');
      console.error(err);
    }
  };

  // 수업 수정 함수
  const handleEditClass = async () => {
    try {
      if (!editingClass) return;
      
      const updatedClasses = classes.map(cls => 
        cls.id === editingClass.id ? editingClass : cls
      );
      
      await classAPI.save(updatedClasses);
      setClasses(updatedClasses);
      setEditingClass(null);
    } catch (err) {
      setError('수업 정보 수정에 실패했습니다.');
      console.error(err);
    }
  };

  // 수업 삭제 함수
  const handleDeleteClass = async (id: number) => {
    try {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        const updatedClasses = classes.filter(cls => cls.id !== id);
        await classAPI.save(updatedClasses);
        setClasses(updatedClasses);
      }
    } catch (err) {
      setError('수업 삭제에 실패했습니다.');
      console.error(err);
    }
  };

  // 학생 이름 가져오기
  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : '알 수 없음';
  };

  // 선생님 이름 가져오기
  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : '알 수 없음';
  };

  // 날짜로부터 요일 구하기 함수
  const getDayOfWeek = (date: string) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayIndex = new Date(date).getDay();
    return days[dayIndex];
  };

  // 새 수업 추가 시 날짜 변경 핸들러
  const handleNewClassDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    const dayOfWeek = getDayOfWeek(date);
    setNewClass({
      ...newClass,
      date: date,
      dayOfWeek: dayOfWeek
    });
  };

  // 수업 수정 시 날짜 변경 핸들러
  const handleEditClassDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingClass) return;
    const date = e.target.value;
    const dayOfWeek = getDayOfWeek(date);
    setEditingClass({
      ...editingClass,
      date: date,
      dayOfWeek: dayOfWeek
    });
  };

  if (isLoading) return <div className="p-8 text-black">로딩 중...</div>;
  if (error) return <div className="p-8 text-red-600 font-bold">에러: {error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto bg-purple-50 min-h-screen">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-900">수업 시간표</h1>
        <div className="space-x-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            새 수업 추가
          </button>
          <Link href="/" className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
            돌아가기
          </Link>
        </div>
      </div>

      {/* 수업 목록 테이블 */}
      <div className="bg-white rounded-lg shadow-lg border border-purple-200">
        <table className="w-full">
          <thead>
            <tr className="bg-purple-100">
              <th className="px-6 py-3 text-left text-purple-900 font-semibold">날짜</th>
              <th className="px-6 py-3 text-left text-purple-900 font-semibold">요일</th>
              <th className="px-6 py-3 text-left text-purple-900 font-semibold">시간</th>
              <th className="px-6 py-3 text-left text-purple-900 font-semibold">학생</th>
              <th className="px-6 py-3 text-left text-purple-900 font-semibold">선생님</th>
              <th className="px-6 py-3 text-left text-purple-900 font-semibold">악기</th>
              <th className="px-6 py-3 text-left text-purple-900 font-semibold">수업시간</th>
              <th className="px-6 py-3 text-left text-purple-900 font-semibold">수업내용</th>
              <th className="px-6 py-3 text-right text-purple-900 font-semibold">관리</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls.id} className="border-t hover:bg-purple-50">
                <td className="px-6 py-4 text-purple-900">{cls.date}</td>
                <td className="px-6 py-4 text-purple-900">{cls.dayOfWeek}</td>
                <td className="px-6 py-4 text-purple-900">{cls.time}</td>
                <td className="px-6 py-4 text-purple-900">{getStudentName(cls.studentId)}</td>
                <td className="px-6 py-4 text-purple-900">{getTeacherName(cls.teacherId)}</td>
                <td className="px-6 py-4 text-purple-900">{cls.instrument}</td>
                <td className="px-6 py-4 text-purple-900">{cls.duration}</td>
                <td className="px-6 py-4 text-purple-900">{cls.content}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => setEditingClass(cls)}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 새 수업 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[800px]">
            <h2 className="text-xl font-bold mb-4 text-purple-900">새 수업 추가</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-700">날짜</label>
                <input
                  type="date"
                  value={newClass.date}
                  onChange={handleNewClassDateChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">요일</label>
                <input
                  type="text"
                  value={newClass.dayOfWeek}
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">시간</label>
                <input
                  type="time"
                  value={newClass.time}
                  onChange={(e) => setNewClass({...newClass, time: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">학생</label>
                <select
                  value={newClass.studentId}
                  onChange={(e) => setNewClass({...newClass, studentId: Number(e.target.value)})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                >
                  <option value={0}>선택하세요</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">선생님</label>
                <select
                  value={newClass.teacherId}
                  onChange={(e) => setNewClass({...newClass, teacherId: Number(e.target.value)})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                >
                  <option value={0}>선택하세요</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">악기</label>
                <input
                  type="text"
                  value={newClass.instrument}
                  onChange={(e) => setNewClass({...newClass, instrument: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">수업시간</label>
                <select
                  value={newClass.duration}
                  onChange={(e) => setNewClass({...newClass, duration: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                >
                  <option value="">선택하세요</option>
                  {durationOptions.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-purple-700">수업내용</label>
                <textarea
                  value={newClass.content}
                  onChange={(e) => setNewClass({...newClass, content: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleAddClass}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수업 수정 모달 */}
      {editingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[800px]">
            <h2 className="text-xl font-bold mb-4 text-purple-900">수업 정보 수정</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-700">날짜</label>
                <input
                  type="date"
                  value={editingClass.date}
                  onChange={handleEditClassDateChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">요일</label>
                <input
                  type="text"
                  value={editingClass.dayOfWeek}
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">시간</label>
                <input
                  type="time"
                  value={editingClass.time}
                  onChange={(e) => setEditingClass({...editingClass, time: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">학생</label>
                <select
                  value={editingClass.studentId}
                  onChange={(e) => setEditingClass({...editingClass, studentId: Number(e.target.value)})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                >
                  <option value={0}>선택하세요</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">선생님</label>
                <select
                  value={editingClass.teacherId}
                  onChange={(e) => setEditingClass({...editingClass, teacherId: Number(e.target.value)})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                >
                  <option value={0}>선택하세요</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">악기</label>
                <input
                  type="text"
                  value={editingClass.instrument}
                  onChange={(e) => setEditingClass({...editingClass, instrument: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">수업시간</label>
                <select
                  value={editingClass.duration}
                  onChange={(e) => setEditingClass({...editingClass, duration: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                >
                  <option value="">선택하세요</option>
                  {durationOptions.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-purple-700">수업내용</label>
                <textarea
                  value={editingClass.content}
                  onChange={(e) => setEditingClass({...editingClass, content: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setEditingClass(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleEditClass}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;