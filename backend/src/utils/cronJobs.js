const cron = require('node-cron');
const Issue = require('../models/Issue');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const { notifyHRs, createNotification } = require('./notificationUtils');

// ─── JOB 1: 48hr Unresolved Issues Alert → runs at 9:00 AM daily ───
cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Running 48hr unresolved issue check...');
    try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const unresolvedIssues = await Issue.find({
            status: 'open',
            createdAt: { $lte: twoDaysAgo }
        }).populate({ path: 'employee', populate: { path: 'user' } });

        if (unresolvedIssues.length > 0) {
            await notifyHRs(
                '⚠️ Unresolved Issues Alert',
                `${unresolvedIssues.length} issue(s) have been open for more than 48 hours. Please review them immediately.`,
                'general'
            );
            console.log(`[CRON] Alerted HRs about ${unresolvedIssues.length} unresolved issues.`);
        }
    } catch (error) {
        console.error('[CRON] Error in 48hr issue job:', error);
    }
});

// ─── JOB 2: Attendance Reminder → runs at 10:00 AM daily ───
// Notifies every employee who hasn't marked attendance yet today
// (and is not on approved leave)
cron.schedule('0 10 * * *', async () => {
    console.log('[CRON] Running attendance reminder job...');
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Get all employees
        const allEmployees = await Employee.find().populate('user');

        for (const emp of allEmployees) {
            if (!emp.user) continue;

            // Skip if on approved leave today
            const onLeave = await Leave.findOne({
                employee: emp._id,
                status: 'approved',
                startDate: { $lte: endOfDay },
                endDate: { $gte: startOfDay }
            });
            if (onLeave) continue;

            // Check if attendance already marked today
            const attendanceToday = await Attendance.findOne({
                employee: emp._id,
                date: { $gte: startOfDay, $lte: endOfDay }
            });

            // If no attendance record found → send notification
            if (!attendanceToday) {
                await createNotification(
                    emp.user._id,
                    '🔔 Attendance Reminder',
                    "You haven't marked your attendance yet today. Please check in as soon as possible.",
                    'attendance'
                );
            }
        }

        console.log('[CRON] Attendance reminder notifications sent.');
    } catch (error) {
        console.error('[CRON] Error in attendance reminder job:', error);
    }
});

module.exports = cron;
