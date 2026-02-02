const mongoose = require('mongoose');

const emailOTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    otp: {
        type: String,
        required: [true, 'OTP is required'],
        length: 6
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - document auto-deletes after expiry
    },
    isUsed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for quick lookups
emailOTPSchema.index({ email: 1, otp: 1 });

// Static method to generate 6-digit OTP
emailOTPSchema.statics.generateOTP = function () {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to create and save OTP for an email
emailOTPSchema.statics.createOTP = async function (email) {
    // Delete any existing OTPs for this email
    await this.deleteMany({ email: email.toLowerCase() });

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    const otpDoc = await this.create({
        email: email.toLowerCase(),
        otp,
        expiresAt
    });

    return otp;
};

// Static method to verify OTP
emailOTPSchema.statics.verifyOTP = async function (email, otp) {
    const otpDoc = await this.findOne({
        email: email.toLowerCase(),
        otp,
        isUsed: false,
        expiresAt: { $gt: new Date() }
    });

    if (!otpDoc) {
        return { valid: false, message: 'Invalid or expired OTP' };
    }

    // Mark as used (single-use)
    otpDoc.isUsed = true;
    await otpDoc.save();

    return { valid: true, message: 'OTP verified successfully' };
};

const EmailOTP = mongoose.model('EmailOTP', emailOTPSchema);

module.exports = EmailOTP;
