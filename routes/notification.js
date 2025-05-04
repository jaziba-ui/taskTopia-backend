import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/' , authMiddleware, async(req,res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id}).sort({ createdAt: -1 })

        res.json(notifications)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
})

router.patch('/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
      await Notification.findByIdAndUpdate(id, { read: true });
      res.send('Notification marked as read');
    } catch (error) {
      res.status(500).send('Error updating notification');
    }
  });

export default router