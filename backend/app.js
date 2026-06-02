
const reportRouter = require('./routes/report');
app.use('/api/reports', reportRouter);

const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);
