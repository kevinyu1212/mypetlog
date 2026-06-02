import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchAdminLogs = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
