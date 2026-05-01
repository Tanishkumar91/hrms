const { createNotification } = require('../utils/notificationUtils');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const PDFDocument = require('pdfkit');

// @desc    Generate payroll for all employees for a specific month
// @route   POST /api/payroll/generate
// @access  Private (Admin/HR)
exports.generatePayroll = async (req, res, next) => {
    try {
        const { month, year } = req.body;
        const employees = await Employee.find();

        const payrolls = [];

        for (const emp of employees) {
            const baseSalary = emp.salary.base || 0;
            const allowances = emp.salary.allowances || 0;
            const deductions = emp.salary.deductions || 0;
            const netSalary = baseSalary + allowances - deductions;

            const payroll = await Payroll.findOneAndUpdate(
                { employee: emp._id, month, year },
                {
                    baseSalary,
                    netSalary,
                    status: 'pending'
                },
                { upsert: true, new: true }
            );
            payrolls.push(payroll);
        }

        res.status(201).json({ success: true, count: payrolls.length, data: payrolls });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all payroll records (Admin/HR)
// @route   GET /api/payroll/all
// @access  Private (Admin/HR)
exports.getAllPayroll = async (req, res, next) => {
    try {
        const payroll = await Payroll.find().populate({
            path: 'employee',
            populate: { path: 'user', select: 'name email' }
        }).sort('-year -month');
        res.status(200).json({ success: true, data: payroll });
    } catch (err) {
        next(err);
    }
};

// @desc    Update payroll record
// @route   PUT /api/payroll/:id
// @access  Private (Admin/HR)
exports.updatePayroll = async (req, res, next) => {
    try {
        let payroll = await Payroll.findById(req.params.id);
        if (!payroll) {
            return res.status(404).json({ success: false, message: 'Payroll record not found' });
        }

        const { baseSalary, allowances, deductions, status } = req.body;

        if (baseSalary !== undefined || allowances || deductions) {
            const base = baseSalary !== undefined ? baseSalary : payroll.baseSalary;
            const allowTotal = (allowances || payroll.allowances).reduce((acc, curr) => acc + (curr.amount || 0), 0);
            const deductTotal = (deductions || payroll.deductions).reduce((acc, curr) => acc + (curr.amount || 0), 0);
            req.body.netSalary = base + allowTotal - deductTotal;
        }

        payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate({
            path: 'employee',
            populate: { path: 'user', select: 'name email' }
        });

        // Send email with PDF if status is marked as paid
        if (status === 'paid') {
            try {
                const sendEmail = require('../services/emailService');
                const PDFDocument = require('pdfkit');

                // Generate PDF Buffer
                const pdfBuffer = await new Promise((resolve) => {
                    const doc = new PDFDocument({ margin: 50 });
                    let buffers = [];
                    doc.on('data', buffers.push.bind(buffers));
                    doc.on('end', () => resolve(Buffer.concat(buffers)));

                    doc.fontSize(20).text('SALARY PAYSLIP', { align: 'center' });
                    doc.moveDown();
                    doc.fontSize(12).text(`Month/Year: ${payroll.month}/${payroll.year}`, { align: 'right' });
                    doc.moveDown();

                    doc.fontSize(14).text('Employee Details', { underline: true });
                    doc.fontSize(12).text(`Name: ${payroll.employee.user.name}`);
                    doc.fontSize(12).text(`Employee ID: ${payroll.employee.employeeId}`);
                    doc.fontSize(12).text(`Designation: ${payroll.employee.designation}`);
                    doc.fontSize(12).text(`Department: ${payroll.employee.department}`);
                    doc.moveDown();

                    doc.fontSize(14).text('Salary Breakdown', { underline: true });
                    doc.fontSize(12).text(`Base Salary: $${payroll.baseSalary.toLocaleString()}`);
                    
                    doc.text('Allowances:');
                    payroll.allowances.forEach(a => {
                        doc.text(`  - ${a.type || 'Other'}: $${a.amount.toLocaleString()}`);
                    });

                    doc.text('Deductions:');
                    payroll.deductions.forEach(d => {
                        doc.text(`  - ${d.type || 'Other'}: $${d.amount.toLocaleString()}`);
                    });
                    
                    doc.moveDown();
                    doc.fontSize(14).fillColor('green').text(`Net Salary: $${payroll.netSalary.toLocaleString()}`, { bold: true });
                    doc.fillColor('black');
                    doc.moveDown();

                    doc.fontSize(12).text(`Status: ${payroll.status.toUpperCase()}`, { align: 'center' });
                    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });

                    doc.end();
                });

                await sendEmail({
                    email: payroll.employee.user.email,
                    subject: `Payslip for ${payroll.month}/${payroll.year}`,
                    message: `Hello ${payroll.employee.user.name},\n\nYour payroll for ${payroll.month}/${payroll.year} has been processed and marked as PAID.\n\nPlease find your payslip attached.\n\nBest Regards,\nHR Team`,
                    attachments: [
                        {
                            filename: `Payslip-${payroll.month}-${payroll.year}.pdf`,
                            content: pdfBuffer,
                            contentType: 'application/pdf'
                        }
                    ]
                });
            } catch (emailErr) {
                console.error('Email could not be sent:', emailErr);
            }
        }

        // Send notification if paid
        if (status === 'paid') {
            await createNotification(payroll.employee.user._id, 'Payroll Processed', `Your payroll for ${payroll.month}/${payroll.year} has been processed and paid.`, 'payroll');
        }

        res.status(200).json({ success: true, data: payroll });
    } catch (err) {
        next(err);
    }
};

// @desc    Download payslip PDF
// @route   GET /api/payroll/download/:id
// @access  Private
exports.downloadPayslip = async (req, res, next) => {
    try {
        const payroll = await Payroll.findById(req.params.id).populate({
            path: 'employee',
            populate: { path: 'user', select: 'name email' }
        });

        if (!payroll) {
            return res.status(404).json({ success: false, message: 'Payroll record not found' });
        }

        // Authorization: HR/Admin can download any, employee only their own
        if (req.user.role === 'employee') {
            const employee = await Employee.findOne({ user: req.user.id });
            if (payroll.employee._id.toString() !== employee._id.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized' });
            }
        }

        const doc = new PDFDocument({ margin: 50 });
        const filename = `Payslip-${payroll.employee.user.name}-${payroll.month}-${payroll.year}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('SALARY PAYSLIP', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Month/Year: ${payroll.month}/${payroll.year}`, { align: 'right' });
        doc.moveDown();

        // Employee Info
        doc.fontSize(14).text('Employee Details', { underline: true });
        doc.fontSize(12).text(`Name: ${payroll.employee.user.name}`);
        doc.fontSize(12).text(`Employee ID: ${payroll.employee.employeeId}`);
        doc.fontSize(12).text(`Designation: ${payroll.employee.designation}`);
        doc.fontSize(12).text(`Department: ${payroll.employee.department}`);
        doc.moveDown();

        // Salary Breakdown
        doc.fontSize(14).text('Salary Breakdown', { underline: true });
        doc.fontSize(12).text(`Base Salary: $${payroll.baseSalary.toLocaleString()}`);
        
        doc.text('Allowances:');
        payroll.allowances.forEach(a => {
            doc.text(`  - ${a.type || 'Other'}: $${a.amount.toLocaleString()}`);
        });

        doc.text('Deductions:');
        payroll.deductions.forEach(d => {
            doc.text(`  - ${d.type || 'Other'}: $${d.amount.toLocaleString()}`);
        });
        
        doc.moveDown();
        doc.fontSize(14).fillColor('green').text(`Net Salary: $${payroll.netSalary.toLocaleString()}`, { bold: true });
        doc.fillColor('black');
        doc.moveDown();

        doc.fontSize(12).text(`Status: ${payroll.status.toUpperCase()}`, { align: 'center' });
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });

        doc.end();
    } catch (err) {
        next(err);
    }
};

// @desc    Get payroll for current user
// @route   GET /api/payroll/me
// @access  Private
exports.getMyPayroll = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }
        const payroll = await Payroll.find({ employee: employee._id }).sort('-year -month');
        res.status(200).json({ success: true, data: payroll });
    } catch (err) {
        next(err);
    }
};
