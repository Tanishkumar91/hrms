const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true
}));

// Request Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes Placeholder
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'HRMS API is running' });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const issueRoutes = require('./routes/issueRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tasks', taskRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
