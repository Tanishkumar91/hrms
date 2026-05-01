const Employee = require('../models/Employee');
const User = require('../models/User');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (Admin/HR)
exports.getEmployees = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        query = Employee.find(JSON.parse(queryStr)).populate('user', 'name email role status');

        // Search functionality
        if (req.query.search) {
            const search = req.query.search;
            
            // Find matching users first since name is in User model
            const matchingUsers = await User.find({ 
                name: { $regex: search, $options: 'i' } 
            }).select('_id');
            const userIds = matchingUsers.map(u => u._id);

            query = query.find({
                $or: [
                    { employeeId: { $regex: search, $options: 'i' } },
                    { designation: { $regex: search, $options: 'i' } },
                    { department: { $regex: search, $options: 'i' } },
                    { user: { $in: userIds } }
                ]
            });
        }

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Employee.countDocuments();

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const employees = await query.lean();

        // Inject today's status
        const Attendance = require('../models/Attendance');
        const Leave = require('../models/Leave');
        
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        for (let emp of employees) {
            // Check if on leave
            const activeLeave = await Leave.findOne({
                employee: emp._id,
                status: 'approved',
                startDate: { $lte: endOfDay },
                endDate: { $gte: startOfDay }
            });

            if (activeLeave) {
                emp.todayStatus = 'On Leave';
                continue;
            }

            // Check if present/absent
            const attendance = await Attendance.findOne({
                employee: emp._id,
                date: { $gte: startOfDay, $lte: endOfDay }
            });

            if (attendance) {
                emp.todayStatus = attendance.status === 'present' ? 'Present' : 'Absent';
            } else {
                emp.todayStatus = 'Not Marked';
            }
        }

        // Pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: employees.length,
            pagination,
            data: employees
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id).populate('user', 'name email role status');
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.status(200).json({ success: true, data: employee });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin/HR)
exports.createEmployee = async (req, res, next) => {
    try {
        // First check if user exists or create one if not provided
        // For simplicity, let's assume the body contains user info to create a new user too
        const { name, email, password, role, ...employeeData } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        const user = await User.create({ name, email, password, role: role || 'employee' });

        const employee = await Employee.create({
            ...employeeData,
            user: user._id
        });

        res.status(201).json({ success: true, data: employee });
    } catch (err) {
        next(err);
    }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin/HR/Owner)
exports.updateEmployee = async (req, res, next) => {
    try {
        let employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Authorization check (Admin/HR or self)
        if (req.user.role !== 'hr' && employee.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: employee });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
exports.deleteEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Delete associated user
        await User.findByIdAndDelete(employee.user);
        await Employee.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
