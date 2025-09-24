const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// GET all notifications for mentor (sent by them)
router.get('/mentor', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ createdBy: req.user._id })
      .populate('recipients.user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching mentor notifications:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// GET all notifications for student (received by them)
router.get('/student', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      isActive: true,
      $or: [
        { 'recipients.user': req.user._id }, // Direct recipient
        { isBroadcast: true } // Broadcast notifications
      ],
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    // Add read status and reaction for this user
    const notificationsWithUserData = notifications.map(notification => {
      const recipient = notification.recipients.find(r => r.user._id.toString() === req.user._id.toString());
      return {
        ...notification.toObject(),
        isRead: !!recipient?.readAt,
        userReaction: recipient?.reaction || null
      };
    });
    
    res.json(notificationsWithUserData);
  } catch (err) {
    console.error('Error fetching student notifications:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// CREATE new notification
router.post('/', protect, async (req, res) => {
  try {
    const { title, message, type, priority, recipients, expiresAt } = req.body;

    // Get all students if no specific recipients provided
    let recipientIds = recipients || [];
    const isBroadcast = !recipients || recipients.length === 0;
    if (isBroadcast) {
      const students = await User.find({ role: 'student' }).select('_id');
      recipientIds = students.map(student => student._id);
    }

    const notification = new Notification({
      title,
      message,
      type: type || 'general',
      priority: priority || 'medium',
      createdBy: req.user._id,
      recipients: recipientIds.map(userId => ({ user: userId })),
      isBroadcast,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await notification.save();
    
    const populatedNotification = await Notification.findById(notification._id)
      .populate('recipients.user', 'name email')
      .populate('createdBy', 'name');

    res.status(201).json({
      message: 'Notification created successfully',
      notification: populatedNotification
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

// MARK notification as read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Find the recipient and mark as read
    // For broadcast notifications, we might need to add the user to recipients
    let recipientIndex = notification.recipients.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );

    // If user is not in recipients and this is a broadcast notification, 
    // add them to the recipients list
    if (recipientIndex === -1 && notification.isBroadcast) {
      notification.recipients.push({
        user: req.user._id,
        readAt: null,
        reaction: null
      });
      recipientIndex = notification.recipients.length - 1;
      // Save the updated notification
      await notification.save();
    }

    if (recipientIndex === -1) {
      return res.status(403).json({ message: 'Access denied' });
    }

    notification.recipients[recipientIndex].readAt = new Date();
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// ADD reaction to notification
router.patch('/:id/reaction', protect, async (req, res) => {
  try {
    const { reaction } = req.body;
    const validReactions = ['like', 'love', 'helpful', 'confused'];
    
    if (!validReactions.includes(reaction)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }

    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Find the recipient and add reaction
    // For broadcast notifications, we might need to add the user to recipients
    let recipientIndex = notification.recipients.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );

    // If user is not in recipients and this is a broadcast notification, 
    // add them to the recipients list
    if (recipientIndex === -1 && notification.isBroadcast) {
      notification.recipients.push({
        user: req.user._id,
        readAt: null,
        reaction: null
      });
      recipientIndex = notification.recipients.length - 1;
      // Save the updated notification
      await notification.save();
    }

    if (recipientIndex === -1) {
      return res.status(403).json({ message: 'Access denied' });
    }

    notification.recipients[recipientIndex].reaction = reaction;
    await notification.save();

    res.json({ message: 'Reaction added successfully' });
  } catch (err) {
    console.error('Error adding reaction:', err);
    res.status(500).json({ message: 'Failed to add reaction' });
  }
});

// UPDATE notification
router.put('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('recipients.user', 'name email')
      .populate('createdBy', 'name');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      message: 'Notification updated successfully',
      notification
    });
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({ message: 'Failed to update notification' });
  }
});

// DELETE notification
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// GET notification statistics for mentor
router.get('/stats', protect, async (req, res) => {
  try {
    const totalNotifications = await Notification.countDocuments({ createdBy: req.user._id });
    
    // Get notifications with reaction counts
    const notifications = await Notification.find({ createdBy: req.user._id });
    
    let totalReactions = 0;
    let totalReads = 0;
    let totalRecipients = 0;
    
    notifications.forEach(notification => {
      notification.recipients.forEach(recipient => {
        totalRecipients++;
        if (recipient.readAt) totalReads++;
        if (recipient.reaction) totalReactions++;
      });
    });

    const readRate = totalRecipients > 0 ? ((totalReads / totalRecipients) * 100).toFixed(1) : 0;
    const reactionRate = totalRecipients > 0 ? ((totalReactions / totalRecipients) * 100).toFixed(1) : 0;

    res.json({
      totalNotifications,
      totalReactions,
      readRate: parseFloat(readRate),
      reactionRate: parseFloat(reactionRate)
    });
  } catch (err) {
    console.error('Error fetching notification stats:', err);
    res.status(500).json({ message: 'Failed to fetch notification stats' });
  }
});

module.exports = router;