'use client';
import { useState, useEffect } from 'react';
import { Payment, Student } from '@/types';
import { paymentAPI, studentAPI } from '@/utils/data';
import Link from 'next/link';

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [newPayment, setNewPayment] = useState({
    date: '',
    studentId: 0,
    amount: 0,
    method: '',
    status: '',
    memo: ''
  });

  // 데이터 불러오기
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [paymentsData, studentsData] = await Promise.all([
        paymentAPI.getAll(),
        studentAPI.getAll()
      ]);
      setPayments(paymentsData);
      setStudents(studentsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('데이터 로딩 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 결제 추가 함수
  const handleAddPayment = async () => {
    try {
      if (!newPayment.date || !newPayment.studentId || !newPayment.amount) {
        alert('필수 필드를 모두 입력해주세요.');
        return;
      }

      const newId = Math.max(0, ...payments.map(p => p.id)) + 1;
      const paymentWithId = { ...newPayment, id: newId };
      
      const updatedPayments = [...payments, paymentWithId];
      await paymentAPI.save(updatedPayments);
      
      setPayments(updatedPayments);
      setIsModalOpen(false);
      setNewPayment({
        date: '',
        studentId: 0,
        amount: 0,
        method: '',
        status: '',
        memo: ''
      });
    } catch (err) {
      setError('결제 추가에 실패했습니다.');
      console.error(err);
    }
  };

  // 결제 수정 함수
  const handleEditPayment = async () => {
    try {
      if (!editingPayment) return;
      
      const updatedPayments = payments.map(payment => 
        payment.id === editingPayment.id ? editingPayment : payment
      );
      
      await paymentAPI.save(updatedPayments);
      setPayments(updatedPayments);
      setEditingPayment(null);
    } catch (err) {
      setError('결제 정보 수정에 실패했습니다.');
      console.error(err);
    }
  };

  // 결제 삭제 함수
  const handleDeletePayment = async (id: number) => {
    try {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        const updatedPayments = payments.filter(payment => payment.id !== id);
        await paymentAPI.save(updatedPayments);
        setPayments(updatedPayments);
      }
    } catch (err) {
      setError('결제 삭제에 실패했습니다.');
      console.error(err);
    }
  };

  // 학생 이름 가져오기
  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : '알 수 없음';
  };

  if (isLoading) return <div className="p-8 text-black">로딩 중...</div>;
  if (error) return <div className="p-8 text-red-600 font-bold">에러: {error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto bg-yellow-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-900">결제 관리</h1>
        <div className="space-x-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            새 결제 추가
          </button>
          <Link href="/" className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
            돌아가기
          </Link>
        </div>
      </div>

      {/* 결제 목록 테이블 */}
      <div className="bg-white rounded-lg shadow-lg border border-yellow-200">
        <table className="w-full">
          <thead>
            <tr className="bg-yellow-100">
              <th className="px-6 py-3 text-left text-yellow-900 font-semibold">날짜</th>
              <th className="px-6 py-3 text-left text-yellow-900 font-semibold">학생</th>
              <th className="px-6 py-3 text-left text-yellow-900 font-semibold">금액</th>
              <th className="px-6 py-3 text-left text-yellow-900 font-semibold">결제방법</th>
              <th className="px-6 py-3 text-left text-yellow-900 font-semibold">상태</th>
              <th className="px-6 py-3 text-left text-yellow-900 font-semibold">메모</th>
              <th className="px-6 py-3 text-right text-yellow-900 font-semibold">관리</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t hover:bg-yellow-50">
                <td className="px-6 py-4 text-yellow-900">{payment.date}</td>
                <td className="px-6 py-4 text-yellow-900">{getStudentName(payment.studentId)}</td>
                <td className="px-6 py-4 text-yellow-900">{payment.amount.toLocaleString()}원</td>
                <td className="px-6 py-4 text-yellow-900">{payment.method}</td>
                <td className="px-6 py-4 text-yellow-900">{payment.status}</td>
                <td className="px-6 py-4 text-yellow-900">{payment.memo}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => setEditingPayment(payment)}
                    className="text-yellow-600 hover:text-yellow-800 font-medium"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeletePayment(payment.id)}
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

      {/* 새 결제 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[600px]">
            <h2 className="text-xl font-bold mb-4 text-yellow-900">새 결제 추가</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-yellow-700">날짜</label>
                <input
                  type="date"
                  value={newPayment.date}
                  onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700">학생</label>
                <select
                  value={newPayment.studentId}
                  onChange={(e) => setNewPayment({...newPayment, studentId: Number(e.target.value)})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                >
                  <option value={0}>선택하세요</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700">금액</label>
                <input
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({...newPayment, amount: Number(e.target.value)})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700">결제방법</label>
                <select
                  value={newPayment.method}
                  onChange={(e) => setNewPayment({...newPayment, method: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                >
                  <option value="">선택하세요</option>
                  <option value="현금">현금</option>
                  <option value="카드">카드</option>
                  <option value="계좌이체">계좌이체</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700">상태</label>
                <select
                  value={newPayment.status}
                  onChange={(e) => setNewPayment({...newPayment, status: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                >
                  <option value="">선택하세요</option>
                  <option value="완료">완료</option>
                  <option value="대기">대기</option>
                  <option value="취소">취소</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700">메모</label>
                <textarea
                  value={newPayment.memo}
                  onChange={(e) => setNewPayment({...newPayment, memo: e.target.value})}
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
                onClick={handleAddPayment}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결제 수정 모달 */}
      {editingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[600px]">
            <h2 className="text-xl font-bold mb-4 text-yellow-900">결제 정보 수정</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-yellow-700">날짜</label>
                <input
                  type="date"
                  value={editingPayment.date}
                  onChange={(e) => setEditingPayment({...editingPayment, date: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700">학생</label>
                <select
                  value={editingPayment.studentId}
                  onChange={(e) => setEditingPayment({...editingPayment, studentId: Number(e.target.value)})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                >
                  <option value={0}>선택하세요</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700">금액</label>
                <input
                  type="number"
                  value={editingPayment.amount}
                  onChange={(e) => setEditingPayment({...editingPayment, amount: Number(e.target.value)})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700">결제방법</label>
                <select
                  value={editingPayment.method}
                  onChange={(e) => setEditingPayment({...editingPayment, method: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                >
                  <option value="">선택하세요</option>
                  <option value="현금">현금</option>
                  <option value="카드">카드</option>
                  <option value="계좌이체">계좌이체</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700">상태</label>
                <select
                  value={editingPayment.status}
                  onChange={(e) => setEditingPayment({...editingPayment, status: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                >
                  <option value="">선택하세요</option>
                  <option value="완료">완료</option>
                  <option value="대기">대기</option>
                  <option value="취소">취소</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700">메모</label>
                <textarea
                  value={editingPayment.memo}
                  onChange={(e) => setEditingPayment({...editingPayment, memo: e.target.value})}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setEditingPayment(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleEditPayment}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
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

export default PaymentsPage;