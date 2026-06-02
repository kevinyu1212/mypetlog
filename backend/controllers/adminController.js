const db = require('../config/db');

exports.getAdminLogs = async (req, res) => {
    // 실제 서비스 운영 시에는 req.user.role === 'admin' 검증 프로세스가 필요합니다.
    try {
        const [logs] = await db.query(
            `SELECT al.id, al.action, al.target_id, al.created_at, u.nickname AS admin_name
             FROM admin_logs al
             JOIN users u ON al.admin_id = u.id
             ORDER BY al.created_at DESC`
        );
        return res.status(200).json({ success: true, logs });
    } catch (error) {
        console.error('관리자 로그 조회 실패:', error);
        return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
};

exports.processReport = async (req, res) => {
    const admin_id = req.user.id;
    const { reportId } = req.params;
    const { status, actionType, postId } = req.body; // status: 'resolved' 또는 'rejected', actionType: 'BLIND' 등

    if (!['resolved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: '올바르지 않은 처리 상태입니다.' });
    }

    try {
        // 1. 신고 테이블 상태 업데이트
        await db.query(`UPDATE reports SET status = ? WHERE id = ?`, [status, reportId]);

        // 2. 만약 승인(resolved)이면서 블라인드 처리를 요청한 경우 게시글 차단
        if (status === 'resolved' && actionType === 'BLIND' && postId) {
            await db.query(`UPDATE posts SET is_blocked = TRUE WHERE id = ?`, [postId]);
            
            // 관리자 보안 로그 적재
            await db.query(
                `INSERT INTO admin_logs (admin_id, action, target_id) VALUES (?, ?, ?)`,
                [admin_id, 'POST_BLINDED_BY_REPORT', postId]
            );
        } else {
            // 단순 기각 또는 처리 로그 적재
            await db.query(
                `INSERT INTO admin_logs (admin_id, action, target_id) VALUES (?, ?, ?)`,
                [admin_id, status === 'resolved' ? 'REPORT_RESOLVED' : 'REPORT_REJECTED', reportId]
            );
        }

        return res.status(200).json({ success: true, message: '신고 처리가 성공적으로 반영되었습니다.' });
    } catch (error) {
        console.error('신고 조치 중 서버 에러:', error);
        return res.status(500).json({ message: '서버 조치 처리 중 오류가 발생했습니다.' });
    }
};
