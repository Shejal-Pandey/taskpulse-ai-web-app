const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists with this Google ID or email
            let user = await User.findOne({
                $or: [
                    { googleId: profile.id },
                    { email: profile.emails[0].value.toLowerCase() }
                ]
            });

            if (user) {
                // Update Google ID if not set
                if (!user.googleId) {
                    user.googleId = profile.id;
                    user.isEmailVerified = true;
                    await user.save();
                }

                // Update last login
                user.lastLogin = new Date();
                await user.save({ validateBeforeSave: false });

                return done(null, user);
            }

            // Create new user from Google profile
            user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value.toLowerCase(),
                googleId: profile.id,
                password: `google_${profile.id}_${Date.now()}`, // Random password for OAuth users
                isEmailVerified: true,
                role: 'employee',
                department: 'General',
                lastLogin: new Date()
            });

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));

    console.log('✅ Google OAuth Strategy configured');
} else {
    console.log('⚠️  Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
}

module.exports = passport;
