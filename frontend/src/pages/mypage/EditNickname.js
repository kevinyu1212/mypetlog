import React, { useState } from 'react';
import axios from 'axios';

function EditNickname() {
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    axios.put('http://localhost:5000/api/users/nickname', { nickname }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => alert('닉네임이 성공적으로 변경되었습니다.'))
    .catch(err => console.error(err));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>닉네임 변경</h2>
      <div style={{ marginTop: '20px' }}>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="새 닉네임 입력" 
            value={nickname} 
            onChange={(e) => setNickname(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#096dd9', color: '#fff', border: 'none', borderRadius: '4px' }}>변경하기</button>
        </form>
      </div>
    </div>
  );
}

export default EditNickname;
