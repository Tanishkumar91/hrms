const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async (recipientId, title, message, type, link = null) => {
    try {
        await Notification.create({
            recipient: recipientId,
            title,
            message,
            type,
            link
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

const notifyHRs = async (title, message, type) => {
    try {
        const hrs = await User.find({ role: 'hr' });
        const notifications = hrs.map(hr => ({
            recipient: hr._id,
            title,
            message,
            type
        }));
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
    } catch (error) {
         console.error('Error creating HR notifications:', error);
    }
};

module.exports = { createNotification, notifyHRs };
