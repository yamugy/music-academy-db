'use client'
import React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Teacher } from '@/types'
import { teacherAPI } from '@/utils/data'

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    instrument: '',
    phone: '',
    bankAccount: ''
  })

  // 선생님 데이터 불러오기
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await teacherAPI.getAll();
      setTeachers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '선생님 데이터를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('선생님 데이터 로딩 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 선생님 추가 함수
  const handleAddTeacher = async () => {
    try {
      if (!newTeacher.name || !newTeacher.instrument || !newTeacher.phone || !newTeacher.bankAccount) {
        alert('모든 필드를 입력해주세요.');
        return;
      }

      const newId = Math.max(0, ...teachers.map(t => t.id)) + 1;
      const teacherWithId = { ...newTeacher, id: newId };
      
      const updatedTeachers = [...teachers, teacherWithId];
      await teacherAPI.save(updatedTeachers);
      
      setTeachers(updatedTeachers);
      setIsModalOpen(false);
      setNewTeacher({ name: '', instrument: '', phone: '', bankAccount: '' });
    } catch (err) {
      setError('선생님 추가에 실패했습니다.');
      console.error(err);
    }
  };

  // 선생님 수정 함수
  const handleEditTeacher = async () => {
    try {
      if (!editingTeacher) return;
      
      const updatedTeachers = teachers.map(teacher => 
        teacher.id === editingTeacher.id ? editingTeacher : teacher
      );
      
      await teacherAPI.save(updatedTeachers);
      setTeachers(updatedTeachers);
      setEditingTeacher(null);
    } catch (err) {
      setError('선생님 정보 수정에 실패했습니다.');
      console.error(err);
    }
  };

  // 선생님 삭제 함수
  const handleDeleteTeacher = async (id: number) => {
    try {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        const updatedTeachers = teachers.filter(teacher => teacher.id !== id);
        await teacherAPI.save(updatedTeachers);
        setTeachers(updatedTeachers);
      }
    } catch (err) {
      setError('선생님 삭제에 실패했습니다.');
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-green-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-900">선생님 관리</h1>
        <div className="space-x-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            새 선생님 추가
          </button>
          <Link href="/" className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
            돌아가기
          </Link>
        </div>
      </div>

      {/* 선생님 목록 테이블 */}
      <div className="bg-white rounded-lg shadow-lg border border-green-200">
        <table className="w-full">
          <thead>
            <tr className="bg-green-100">
              <th className="px-6 py-3 text-left text-green-900 font-semibold">이름</th>
              <th className="px-6 py-3 text-left text-green-900 font-semibold">악기</th>
              <th className="px-6 py-3 text-left text-green-900 font-semibold">연락처</th>
              <th className="px-6 py-3 text-left text-green-900 font-semibold">계좌번호</th>
              <th className="px-6 py-3 text-right text-green-900 font-semibold">관리</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="border-t hover:bg-green-50">
                <td className="px-6 py-4 text-green-900">{teacher.name}</td>
                <td className="px-6 py-4 text-green-900">{teacher.instrument}</td>
                <td className="px-6 py-4 text-green-900">{teacher.phone}</td>
                <td className="px-6 py-4 text-green-900">{teacher.bankAccount}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditingTeacher(teacher)
                    }}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteTeacher(teacher.id)}
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

      {/* 수정 모달 */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[600px]">
            <h2 className="text-xl font-bold mb-4 text-green-900">선생님 정보 수정</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700">이름</label>
                <input
                  type="text"
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({...editingTeacher, name: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2 text-green-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700">악기</label>
                <input
                  type="text"
                  value={editingTeacher.instrument}
                  onChange={(e) => setEditingTeacher({...editingTeacher, instrument: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2 text-green-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700">연락처</label>
                <input
                  type="tel"
                  value={editingTeacher.phone}
                  onChange={(e) => setEditingTeacher({...editingTeacher, phone: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2 text-green-900 bg-white"
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700">계좌번호</label>
                <input
                  type="text"
                  value={editingTeacher.bankAccount}
                  onChange={(e) => setEditingTeacher({...editingTeacher, bankAccount: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2 text-green-900 bg-white"
                  placeholder="예: 신한은행 110-123-456789"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={handleEditTeacher}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 새 선생님 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[600px]">
            <h2 className="text-xl font-bold mb-4 text-green-900">새 선생님 추가</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700">이름</label>
                <input
                  type="text"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2 text-green-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700">악기</label>
                <input
                  type="text"
                  value={newTeacher.instrument}
                  onChange={(e) => setNewTeacher({...newTeacher, instrument: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2 text-green-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700">연락처</label>
                <input
                  type="tel"
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2 text-green-900 bg-white"
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700">계좌번호</label>
                <input
                  type="text"
                  value={newTeacher.bankAccount}
                  onChange={(e) => setNewTeacher({...newTeacher, bankAccount: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2 text-green-900 bg-white"
                  placeholder="예: 신한은행 110-123-456789"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={handleAddTeacher}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeachersPage