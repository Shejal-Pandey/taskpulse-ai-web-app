const mongoose = require('mongoose');

// Helper function to generate unique report ID
const generateReportId = () => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RPT-${dateStr}-${random}`;
};

const dailyReportSchema = new mongoose.Schema({
    reportId: {
        type: String,
        unique: true,
        default: generateReportId
    },
    employeeName: {
        type: String,
        required: [true, 'Employee name is required'],
        trim: true
    },
    employeeEmail: {
        type: String,
        required: [true, 'Employee email is required'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: [true, 'Report date is required'],
        default: Date.now
    },
    tasksCompleted: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        category: {
            type: String,
            enum: ['development', 'meeting', 'review', 'documentation', 'testing', 'other'],
            default: 'other'
        }
    }],
    workSummary: {
        type: String,
        required: [true, 'Work summary is required'],
        trim: true,
        minlength: [10, 'Work summary must be at least 10 characters'],
        maxlength: [2000, 'Work summary cannot exceed 2000 characters']
    },
    hoursWorked: {
        type: Number,
        required: [true, 'Hours worked is required'],
        min: [0, 'Hours worked cannot be negative'],
        max: [24, 'Hours worked cannot exceed 24']
    },
    status: {
        type: String,
        enum: ['Submitted', 'Reviewed', 'Pending'],
        default: 'Submitted'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    managerNotes: {
        type: String,
        trim: true,
        maxlength: [500, 'Manager notes cannot exceed 500 characters']
    },
    blockers: {
        type: String,
        trim: true,
        maxlength: [500, 'Blockers description cannot exceed 500 characters']
    },
    plannedTomorrow: {
        type: String,
        trim: true,
        maxlength: [1000, 'Tomorrow\'s plan cannot exceed 1000 characters']
    }
}, {
    timestamps: true
});

// Indexes for faster queries
dailyReportSchema.index({ employeeId: 1, date: -1 });
dailyReportSchema.index({ date: -1 });
dailyReportSchema.index({ status: 1 });
dailyReportSchema.index({ employeeEmail: 1 });

// Static method to find reports by date range
dailyReportSchema.statics.findByDateRange = function (startDate, endDate, filters = {}) {
    const query = {
        date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        },
        ...filters
    };
    return this.find(query).sort({ date: -1 });
};

// Static method to find today's report for an employee
dailyReportSchema.statics.findTodayReport = async function (employeeId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.findOne({
        employeeId,
        date: {
            $gte: today,
            $lt: tomorrow
        }
    });
};

// Instance method to check if report is editable (same day only)
dailyReportSchema.methods.isEditable = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reportDate = new Date(this.date);
    reportDate.setHours(0, 0, 0, 0);
    return reportDate.getTime() === today.getTime();
};

// Instance method to check if report is deletable (older than 30 days)
dailyReportSchema.methods.isDeletable = function () {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(this.date) < thirtyDaysAgo;
};

const DailyReport = mongoose.model('DailyReport', dailyReportSchema);

module.exports = DailyReport;
