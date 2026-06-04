import React, { useState } from 'react';
import axios from 'axios';

function EditPassword() {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    axios.put('http://localhost:5000/api/users/password', { password }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => alert('비밀번호가 성공적으로 변경되었습니다.'))
    .catch(err => console.error(err));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>비밀번호 변경</h2>
      <div style={{ marginTop: '20px' }}>
        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            placeholder="새 비밀번호 입력" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#096dd9', color: '#fff', border: 'none', borderRadius: '4px' }}>변경하기</button>
        </form>
      </div>
    </div>
  );
}

export default EditPassword;
