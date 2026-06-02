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
