const express = require('express');
const router = express.Router();
const {
    createReport,
    getReports,
    getReport,
    getTodayReport,
    updateReport,
    deleteReport,
    forceDeleteReport,
    getReportStats
} = require('../controllers/reportController');
const { protect, authorize, isManagerOrAdmin } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Report routes
router.post('/', createReport);
router.get('/', getReports);
router.get('/today', getTodayReport);
router.get('/stats', isManagerOrAdmin, getReportStats);
router.get('/:id', getReport);
router.put('/:id', updateReport);

// Admin only routes
router.delete('/:id', deleteReport);
router.delete('/:id/force', authorize('admin'), forceDeleteReport);

module.exports = router;
