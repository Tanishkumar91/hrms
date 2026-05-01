const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const User = require('../models/User');
const Issue = require('../models/Issue');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private (Admin/HR)
exports.getStats = async (req, res, next) => {
    try {
        const totalEmployees = await Employee.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

        // Get present employees today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const presentToday = await Attendance.countDocuments({
            date: { $gte: today }
        });

        // Weekly Attendance Stats (Mon-Fri)
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const weeklyAttendance = await Attendance.aggregate([
            { $match: { date: { $gte: startOfWeek } } },
            {
                $group: {
                    _id: { $dayOfWeek: "$date" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartData = weeklyAttendance.map(item => ({
            name: days[item._id - 1],
            attendance: item.count
        }));

        // Stats by leave type
        const leaveStats = await Leave.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalEmployees,
                activeUsers,
                pendingLeaves,
                presentToday,
                chartData,
                leaveStats
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get my personal stats (Employee)
// @route   GET /api/dashboard/stats/me
// @access  Private
exports.getMyStats = async (req, res, next) => {
    try {
        let employee = await Employee.findOne({ user: req.user.id });
        
        // Self-healing: Create employee profile if missing
        if (!employee && req.user.role === 'employee') {
            employee = await Employee.create({
                user: req.user.id,
                employeeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
                designation: 'Associate',
                department: 'General',
                dateOfJoining: new Date(),
                salary: { base: 30000, allowances: 0, deductions: 0 }
            });
        }

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }

        const myLeaves = await Leave.countDocuments({ employee: employee._id });
        const myIssues = await Issue.countDocuments({ employee: employee._id, status: 'open' });
        const attendance = await Attendance.find({ employee: employee._id });
        const streak = attendance.length; 

        res.status(200).json({
            success: true,
            data: {
                myLeaves,
                myIssues,
                streak
            }
        });
    } catch (err) {
        next(err);
    }
};
