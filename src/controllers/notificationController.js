const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const getNotification = async (req, res) => {
    try {
        const { userId } = req.params;
   
        const notifications = await prisma.notification.findMany({
            where: { user_id: parseInt(userId) },
            orderBy: { created_at: 'desc' } 
        });

       
        const formattedNotifications = notifications.map((notif) => ({
            id: notif.notification_id,
            title: notif.title, 
            message: notif.message,
            time: getTimeAgo(notif.created_at),
            type: notif.type.toLowerCase() , 
            read: notif.status === "READ" 
        }));

        return res.status(200).json({
            success: true,
            notifications: formattedNotifications
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

// Helper function to format time
const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(timestamp)) / 1000); // Difference in seconds

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 7 * 86400) return `${Math.floor(diff / 86400)} days ago`;

    return new Date(timestamp).toLocaleDateString();
};


const markAllNotificationsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        await prisma.notification.updateMany({
            where: { user_id: parseInt(userId) },
            data: { status: "READ" },
        });

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

module.exports = {
	getNotification,
    markAllNotificationsRead
}