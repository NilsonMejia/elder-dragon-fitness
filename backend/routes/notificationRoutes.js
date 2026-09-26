const router = require('express').Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const notifications = require('../services/notificationService');

router.get('/', authenticateToken, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(await notifications.list(req.user));
});

module.exports = router;
