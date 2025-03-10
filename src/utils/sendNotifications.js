const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

// const nodemailer = require("nodemailer")
/**
 * Send an in-app notification by storing it in the database.
 * @param {number} user_id - The recipient user ID.
 * @param {string} message - The notification message.
 */

const sendInAppNotification = async (user_id, message) => {
    try {
        await prisma.notification.create({
            data: {
                user_id,
                message,
                status: 'UNREAD'
            }
        })

        console.log(`In-app notification sent to user ${user_id}: ${message}`)
    } catch (error) {
        console.error('Error sending in-app notification:' , error);
    }
}

const sendNotification = async (user_id,  message) => {
    await sendInAppNotification(user_id, message);
    // await sendEmailNotification(email, subject, message);
};

module.exports= {
    sendNotification
}



