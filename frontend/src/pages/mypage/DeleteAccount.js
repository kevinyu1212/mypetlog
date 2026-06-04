import React, { useState } from 'react';
import axios from 'axios';

function DeleteAccount() {
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = (e) => {
    e.preventDefault();
    if (confirmText !== '탈퇴회원') {
      alert('확인 문구가 올바르지 않습니다.');
      return;
    }
    const token = localStorage.getItem('token');
    axios.delete('http://localhost:5000/api/users/account', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert('회원 탈퇴가 완료되었습니다.');
      localStorage.removeItem('token');
      window.location.href = '/';
    })
    .catch(err => console.error(err));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>회원 탈퇴</h2>
      <p style={{ color: 'red' }}>주의: 탈퇴 시 모든 데이터가 영구 삭제됩니다.</p>
      <div style={{ marginTop: '20px' }}>
        <form onSubmit={handleDelete}>
          <input 
            type="text" 
            placeholder="'탈퇴회원'을 입력하세요" 
            value={confirmText} 
            onChange={(e) => setConfirmText(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px' }}>계정 삭제</button>
        </form>
      </div>
    </div>
  );
}

export default DeleteAccount;
