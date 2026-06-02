import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const submitReport = async (reportData) => {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(`${API_URL}/reports`, reportData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};
