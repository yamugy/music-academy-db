'use client';
import { useState, useEffect } from 'react';
import { Student } from '@/types';
import { studentAPI } from '@/utils/data';
import Link from 'next/link';

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({
    name: '',
    instrument: '',
    phone: ''
  });

  // 학생 데이터 불러오기
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await studentAPI.getAll();
      setStudents(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '학생 데이터를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('학생 데이터 로딩 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 학생 추가 함수
  const handleAddStudent = async () => {
    try {
      if (!newStudent.name || !newStudent.instrument || !newStudent.phone) {
        alert('모든 필드를 입력해주세요.');
        return;
      }

      const newId = Math.max(0, ...students.map(s => s.id)) + 1;
      const studentWithId = { ...newStudent, id: newId };
      
      const updatedStudents = [...students, studentWithId];
      await studentAPI.save(updatedStudents);
      
      setStudents(updatedStudents);
      setIsModalOpen(false);
      setNewStudent({ name: '', instrument: '', phone: '' }); // 폼 초기화
    } catch (err) {
      setError('학생 추가에 실패했습니다.');
      console.error(err);
    }
  };

  // 학생 수정 함수
  const handleEditStudent = async () => {
    try {
      if (!editingStudent) return;
      
      const updatedStudents = students.map(student => 
        student.id === editingStudent.id ? editingStudent : student
      );
      
      await studentAPI.save(updatedStudents);
      setStudents(updatedStudents);
      setEditingStudent(null);
    } catch (err) {
      setError('학생 정보 수정에 실패했습니다.');
      console.error(err);
    }
  };

  // 학생 삭제 함수
  const handleDeleteStudent = async (id: number) => {
    try {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        const updatedStudents = students.filter(student => student.id !== id);
        await studentAPI.save(updatedStudents);
        setStudents(updatedStudents);
      }
    } catch (err) {
      setError('학생 삭제에 실패했습니다.');
      console.error(err);
    }
  };

  if (isLoading) return <div className="p-8 text-black">로딩 중...</div>;
  if (error) return <div className="p-8 text-red-600 font-bold">에러: {error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">학생 관리</h1>
        <div className="space-x-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-medium"
          >
            새 학생 추가
          </button>
          <Link 
            href="/" 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-medium inline-block"
          >
            돌아가기
          </Link>
        </div>
      </div>

      {/* 학생 목록 테이블 */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-black font-semibold">이름</th>
              <th className="px-6 py-3 text-left text-black font-semibold">악기</th>
              <th className="px-6 py-3 text-left text-black font-semibold">연락처</th>
              <th className="px-6 py-3 text-right text-black font-semibold">관리</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 text-black">{student.name}</td>
                <td className="px-6 py-4 text-black">{student.instrument}</td>
                <td className="px-6 py-4 text-black">{student.phone}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => setEditingStudent(student)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
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

      {/* 새 학생 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-black">새 학생 추가</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">이름</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">악기</label>
                <input
                  type="text"
                  value={newStudent.instrument}
                  onChange={(e) => setNewStudent({...newStudent, instrument: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">연락처</label>
                <input
                  type="text"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewStudent({ name: '', instrument: '', phone: '' });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleAddStudent}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 학생 수정 모달 */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-black">학생 정보 수정</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">이름</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">악기</label>
                <input
                  type="text"
                  value={editingStudent.instrument}
                  onChange={(e) => setEditingStudent({...editingStudent, instrument: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">연락처</label>
                <input
                  type="text"
                  value={editingStudent.phone}
                  onChange={(e) => setEditingStudent({...editingStudent, phone: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleEditStudent}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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

export default StudentsPage;