import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchAdminLogs = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateReportStatus = async (reportId, reportData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/admin/reports/${reportId}`, reportData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
