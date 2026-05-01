const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Employee = require('../models/Employee');

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
    try {
        await User.deleteMany();
        await Employee.deleteMany();

        const hr = await User.create({
            name: 'HR User',
            email: 'hr@hrms.com',
            password: 'password123',
            role: 'hr',
            isVerified: true,
            status: 'active'
        });

        const employeeUser = await User.create({
            name: 'John Doe',
            email: 'john@hrms.com',
            password: 'password123',
            role: 'employee',
            isVerified: true,
            status: 'active'
        });

        await Employee.create({
            user: employeeUser._id,
            employeeId: 'EMP001',
            designation: 'Software Engineer',
            department: 'IT',
            dateOfJoining: new Date(),
            salary: { base: 50000, allowances: 5000, deductions: 2000 }
        });

        console.log('Data Seeded Successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
