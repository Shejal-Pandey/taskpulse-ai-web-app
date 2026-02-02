const DailyReport = require('../models/DailyReport');

// @desc    Create a new daily report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res, next) => {
    try {
        const { tasksCompleted, workSummary, hoursWorked, blockers, plannedTomorrow } = req.body;

        // Check if user already submitted a report today
        const existingReport = await DailyReport.findTodayReport(req.user._id);
        if (existingReport) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted a report today. You can update it instead.'
            });
        }

        // Create the report
        const report = await DailyReport.create({
            employeeName: req.user.name,
            employeeEmail: req.user.email,
            employeeId: req.user._id,
            date: new Date(),
            tasksCompleted,
            workSummary,
            hoursWorked,
            blockers,
            plannedTomorrow,
            status: 'Submitted'
        });

        res.status(201).json({
            success: true,
            message: 'Daily report submitted successfully',
            data: { report }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reports (with filters for managers)
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res, next) => {
    try {
        const { startDate, endDate, employeeId, status, page = 1, limit = 10 } = req.query;

        let query = {};

        // If not manager/admin, only show own reports
        if (!['manager', 'admin'].includes(req.user.role)) {
            query.employeeId = req.user._id;
        } else if (employeeId) {
            query.employeeId = employeeId;
        }

        // Date filters
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        // Status filter
        if (status) {
            query.status = status;
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const reports = await DailyReport.find(query)
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('employeeId', 'name email department')
            .populate('reviewedBy', 'name email');

        const total = await DailyReport.countDocuments(query);

        res.status(200).json({
            success: true,
            count: reports.length,
            total,
            pages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: { reports }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Private
const getReport = async (req, res, next) => {
    try {
        const report = await DailyReport.findById(req.params.id)
            .populate('employeeId', 'name email department')
            .populate('reviewedBy', 'name email');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Check if user has access to this report
        if (!['manager', 'admin'].includes(req.user.role) &&
            report.employeeId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this report'
            });
        }

        res.status(200).json({
            success: true,
            data: { report }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get today's report for current user
// @route   GET /api/reports/today
// @access  Private
const getTodayReport = async (req, res, next) => {
    try {
        const report = await DailyReport.findTodayReport(req.user._id);

        res.status(200).json({
            success: true,
            data: { report }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a report (Employee: same-day only, Manager: status)
// @route   PUT /api/reports/:id
// @access  Private
const updateReport = async (req, res, next) => {
    try {
        let report = await DailyReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        const isOwner = report.employeeId.toString() === req.user._id.toString();
        const isManagerOrAdmin = ['manager', 'admin'].includes(req.user.role);

        // Employee can only update their own same-day reports
        if (isOwner && !isManagerOrAdmin) {
            if (!report.isEditable()) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only edit reports submitted today'
                });
            }

            // Employee can update content fields
            const { tasksCompleted, workSummary, hoursWorked, blockers, plannedTomorrow } = req.body;

            report.tasksCompleted = tasksCompleted || report.tasksCompleted;
            report.workSummary = workSummary || report.workSummary;
            report.hoursWorked = hoursWorked !== undefined ? hoursWorked : report.hoursWorked;
            report.blockers = blockers !== undefined ? blockers : report.blockers;
            report.plannedTomorrow = plannedTomorrow !== undefined ? plannedTomorrow : report.plannedTomorrow;
        }
        // Manager can update status and add notes
        else if (isManagerOrAdmin) {
            const { status, managerNotes } = req.body;

            if (status) {
                report.status = status;
                if (status === 'Reviewed') {
                    report.reviewedBy = req.user._id;
                    report.reviewedAt = new Date();
                }
            }
            if (managerNotes !== undefined) {
                report.managerNotes = managerNotes;
            }
        } else {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this report'
            });
        }

        await report.save();

        // Re-fetch with population
        report = await DailyReport.findById(report._id)
            .populate('employeeId', 'name email department')
            .populate('reviewedBy', 'name email');

        res.status(200).json({
            success: true,
            message: 'Report updated successfully',
            data: { report }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = async (req, res, next) => {
    try {
        console.log(`Attempting to delete report: ${req.params.id} by user: ${req.user._id}`);

        const report = await DailyReport.findById(req.params.id);

        if (!report) {
            console.log('Report not found');
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Handle both populated object and direct ID string
        const reportEmployeeId = report.employeeId._id
            ? report.employeeId._id.toString()
            : report.employeeId.toString();

        const userId = req.user._id.toString();

        const isOwner = reportEmployeeId === userId;
        const isAdmin = req.user.role === 'admin';

        console.log(`Report Owner: ${reportEmployeeId}, Request User: ${userId}`);
        console.log(`Is Owner: ${isOwner}, Is Admin: ${isAdmin}`);

        // Allow Admin to delete ANY report
        if (isAdmin) {
            await report.deleteOne();
            return res.status(200).json({
                success: true,
                message: 'Report deleted successfully (Admin)'
            });
        }

        // Allow Employee to delete ANY of their own reports
        if (isOwner) {
            await report.deleteOne();
            return res.status(200).json({
                success: true,
                message: 'Report deleted successfully'
            });
        }

        // If neither
        console.log('Delete denied: Not authorized');
        return res.status(403).json({
            success: false,
            message: `Delete failed. Owner: ${reportEmployeeId}, You: ${userId}. Match? ${isOwner}`
        });

    } catch (error) {
        console.error('Delete error:', error);
        next(error);
    }
};

// @desc    Force delete a report (Admin override)
// @route   DELETE /api/reports/:id/force
// @access  Private/Admin
const forceDeleteReport = async (req, res, next) => {
    try {
        const report = await DailyReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Only admin can force delete
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can force delete reports'
            });
        }

        await report.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Report force deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get report statistics
// @route   GET /api/reports/stats
// @access  Private/Manager/Admin
const getReportStats = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        let dateQuery = {};
        if (startDate || endDate) {
            dateQuery.date = {};
            if (startDate) dateQuery.date.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateQuery.date.$lte = end;
            }
        }

        // Get counts by status
        const statusStats = await DailyReport.aggregate([
            { $match: dateQuery },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Get total reports
        const totalReports = await DailyReport.countDocuments(dateQuery);

        // Get today's submissions count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaySubmissions = await DailyReport.countDocuments({
            date: { $gte: today, $lt: tomorrow }
        });

        // Get average hours worked
        const avgHours = await DailyReport.aggregate([
            { $match: dateQuery },
            { $group: { _id: null, avgHours: { $avg: '$hoursWorked' } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalReports,
                todaySubmissions,
                averageHoursWorked: avgHours[0]?.avgHours?.toFixed(1) || 0,
                statusBreakdown: statusStats.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReport,
    getReports,
    getReport,
    getTodayReport,
    updateReport,
    deleteReport,
    forceDeleteReport,
    getReportStats
};
