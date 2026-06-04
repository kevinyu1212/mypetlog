import React, { useState } from 'react';
import axios from 'axios';

function EditProfilePhoto() {
  const [file, setFile] = useState(null);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    axios.put('http://localhost:5000/api/users/profile-photo', formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(() => alert('프로필 사진이 변경되었습니다.'))
    .catch(err => console.error(err));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>프로필 사진 변경</h2>
      <div style={{ marginTop: '20px' }}>
        <form onSubmit={handleUpload}>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginBottom: '15px' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#096dd9', color: '#fff', border: 'none', borderRadius: '4px' }}>업로드 및 저장</button>
        </form>
      </div>
    </div>
  );
}

export default EditProfilePhoto;
