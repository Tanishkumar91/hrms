const fs = require('fs');
const path = require('path');

const ctrlPath = path.join(__dirname, 'backend', 'src', 'controllers');

// 1. issueController.js
let issueCtrl = fs.readFileSync(path.join(ctrlPath, 'issueController.js'), 'utf8');
if (!issueCtrl.includes('notificationUtils')) {
    issueCtrl = "const { createNotification, notifyHRs } = require('../utils/notificationUtils');\n" + issueCtrl;
    issueCtrl = issueCtrl.replace(
        "res.status(201).json({ success: true, data: issue });",
        "await notifyHRs('New Issue Reported', `An employee reported a new issue: ${req.body.title}`, 'general');\n        res.status(201).json({ success: true, data: issue });"
    );
    issueCtrl = issueCtrl.replace(
        "res.status(200).json({ success: true, data: issue });",
        "if (status === 'resolved') {\n            await createNotification(issue.employee.user._id, 'Issue Resolved', `Your issue \"${issue.title}\" has been resolved.`, 'general');\n        }\n        res.status(200).json({ success: true, data: issue });"
    );
    fs.writeFileSync(path.join(ctrlPath, 'issueController.js'), issueCtrl);
}

// 2. leaveController.js
let leaveCtrl = fs.readFileSync(path.join(ctrlPath, 'leaveController.js'), 'utf8');
if (!leaveCtrl.includes('notificationUtils')) {
    leaveCtrl = "const { createNotification, notifyHRs } = require('../utils/notificationUtils');\n" + leaveCtrl;
    leaveCtrl = leaveCtrl.replace(
        "res.status(201).json({ success: true, data: leave });",
        "await notifyHRs('New Leave Request', `An employee requested leave from ${new Date(req.body.startDate).toLocaleDateString()} to ${new Date(req.body.endDate).toLocaleDateString()}`, 'leave');\n        res.status(201).json({ success: true, data: leave });"
    );
    leaveCtrl = leaveCtrl.replace(
        "res.status(200).json({ success: true, data: leave });",
        "await createNotification(leave.employee.user._id, `Leave ${status}`, `Your leave request has been ${status}.`, 'leave');\n        res.status(200).json({ success: true, data: leave });"
    );
    fs.writeFileSync(path.join(ctrlPath, 'leaveController.js'), leaveCtrl);
}

// 3. payrollController.js
let payrollCtrl = fs.readFileSync(path.join(ctrlPath, 'payrollController.js'), 'utf8');
if (!payrollCtrl.includes('notificationUtils')) {
    payrollCtrl = "const { createNotification } = require('../utils/notificationUtils');\n" + payrollCtrl;
    payrollCtrl = payrollCtrl.replace(
        "res.status(200).json({ success: true, data: payroll });",
        "if (status === 'paid') {\n            await createNotification(payroll.employee.user._id, 'Payroll Processed', `Your payroll for ${payroll.month}/${payroll.year} has been processed and paid.`, 'payroll');\n        }\n        res.status(200).json({ success: true, data: payroll });"
    );
    fs.writeFileSync(path.join(ctrlPath, 'payrollController.js'), payrollCtrl);
}

console.log('Controllers updated');
