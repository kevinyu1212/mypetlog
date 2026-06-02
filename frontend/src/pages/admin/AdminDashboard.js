import React, { useEffect, useState } from 'react';
import { fetchAdminLogs } from '../../services/adminService';

const AdminDashboard = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminLogs()
            .then(data => { if(data.success) setLogs(data.logs); })
            .catch(err => console.error('로그 로드 실패:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: '20px' }}>보안 로그 데이터 로딩 중...</div>;

    return (
        <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2>🛡️ 시스템 관리자 대시보드</h2>
            <p>보안 및 사용자 신고 관련 시스템 운영 로그 타임라인</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '12px' }}>로그 ID</th>
                        <th style={{ padding: '12px' }}>관리자 계정</th>
                        <th style={{ padding: '12px' }}>수행 작업 (Action)</th>
                        <th style={{ padding: '12px' }}>타겟 데이터 ID</th>
                        <th style={{ padding: '12px' }}>발생 일시</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px' }}>{log.id}</td>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{log.admin_name}</td>
                            <td style={{ padding: '12px' }}>
                                <span style={{ background: log.action.includes('REPORT') ? '#fff1f0' : '#e6f7ff', color: log.action.includes('REPORT') ? '#cf1322' : '#096dd9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                    {log.action}
                                </span>
                            </td>
                            <td style={{ padding: '12px' }}>{log.target_id || '-'}</td>
                            <td style={{ padding: '12px', color: '#666' }}>{new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
