import React, { useState } from 'react';
import axios from 'axios';

function EditSecurity() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    axios.put('http://localhost:5000/api/users/security', { currentPassword, newPassword }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => alert('보안 설정이 성공적으로 변경되었습니다.'))
    .catch(err => {
      console.error(err);
      alert('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인하세요.');
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>보안 및 비밀번호 변경</h2>
      <div style={{ marginTop: '20px' }}>
        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            placeholder="현재 비밀번호 입력" 
            value={currentPassword} 
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <input 
            type="password" 
            placeholder="새 비밀번호 입력" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#096dd9', color: '#fff', border: 'none', borderRadius: '4px' }}>
            보안 설정 업데이트
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditSecurity;
