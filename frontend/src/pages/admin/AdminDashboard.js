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

export const AdminReportManagement = () => {
    const [reports, setReports] = useState([
        // 초기 렌더링 검증용 가상 혹은 API 바인딩용 스켈레톤 구조
        { id: 1, reporter_name: '테스트집사', post_id: 7, reason: '음란성 광고 게시글', status: 'pending' }
    ]);

    const handleAction = async (reportId, postId, type) => {
        const confirmCheck = window.confirm(`해당 신고 건에 대해 [${type}] 처리를 진행하시겠습니까?`);
        if (!confirmCheck) return;

        try {
            const payload = type === 'RESOLVE_BLIND' 
                ? { status: 'resolved', actionType: 'BLIND', postId } 
                : { status: 'rejected', actionType: 'NONE', postId: null };

            const res = await updateReportStatus(reportId, payload);
            if (res.success) {
                alert('제재 처분이 완료되었습니다.');
                setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: type === 'RESOLVE_BLIND' ? 'resolved' : 'rejected' } : r));
            }
        } catch (err) {
            console.error('처분 처리 실패:', err);
            alert('권한이 없거나 처리 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', marginTop: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3>🚨 실시간 접수된 유저 신고 내역 제어판</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                {reports.map(rep => (
                    <div key={rep.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #eee', borderRadius: '6px' }}>
                        <div>
                            <strong>신고 고유번호: #{rep.id}</strong> | 피신고 대상 글 번호: <span style={{ color: '#096dd9' }}>#{rep.post_id}</span>
                            <div style={{ color: '#666', marginTop: '5px' }}>사유: {rep.reason} [상태: <span style={{ fontWeight: 'bold' }}>{rep.status}</span>]</div>
                        </div>
                        {rep.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleAction(rep.id, rep.post_id, 'RESOLVE_BLIND')} style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>승인 & 블라인드</button>
                                <button onClick={() => handleAction(rep.id, rep.post_id, 'REJECT')} style={{ background: '#f5f5f5', color: '#333', border: '1px solid #ccc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>신고 기각</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
