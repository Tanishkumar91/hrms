const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    designation: {
        type: String,
        required: [true, 'Please add a designation']
    },
    department: {
        type: String,
        required: [true, 'Please add a department']
    },
    dateOfJoining: {
        type: Date,
        required: true
    },
    phoneNumber: String,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },
    avatar: {
        url: String,
        public_id: String
    },
    documents: [{
        name: String,
        url: String,
        public_id: String,
        type: String // 'resume', 'id_proof', etc.
    }],
    salary: {
        base: Number,
        allowances: Number,
        deductions: Number
    },
    leaveBalance: {
        sick: { type: Number, default: 12 },
        casual: { type: Number, default: 12 },
        paid: { type: Number, default: 15 }
    },
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        ifscCode: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
