const db = require('../config/db');

exports.createReport = async (req, res) => {
    const reporter_id = req.user.id;
    const { post_id, comment_id, reason } = req.body;

    if (!reason) {
        return res.status(400).json({ message: '신고 사유를 입력해주세요.' });
    }

    try {
        const [reportResult] = await db.query(
            `INSERT INTO reports (reporter_id, post_id, comment_id, reason, status) 
             VALUES (?, ?, ?, ?, 'pending')`,
            [reporter_id, post_id || null, comment_id || null, reason]
        );

        await db.query(
            `INSERT INTO admin_logs (admin_id, action, target_id) 
             VALUES (?, ?, ?)`,
            [reporter_id, 'REPORT_RECEIVED', reportResult.insertId] 
        );

        return res.status(201).json({ 
            success: true, 
            message: '신고가 성공적으로 접수되었습니다.',
            reportId: reportResult.insertId 
        });
    } catch (error) {
        console.error('신고 접수 중 에러 발생:', error);
        return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
};
