const express = require('express');
const router = express.Router();
const {
  addLink,
  getLinks,
  getMyLinks,
  updateLink,
  toggleLink,
  clickLink,
  deleteLink,
  reorderLinks,
} = require('../controllers/linkController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addLink);
router.get('/me', protect, getMyLinks);
router.get('/:profileId', getLinks);
router.put('/:id', protect, updateLink);
router.patch('/:id/toggle', protect, toggleLink);
router.patch('/:id/click', clickLink);
router.delete('/:id', protect, deleteLink);
router.post('/reorder', protect, reorderLinks);

module.exports = router;
