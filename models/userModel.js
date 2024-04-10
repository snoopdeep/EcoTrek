const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide us your email'],
        unique: true,
        lowercase: true,
        validator: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
        type: String,
        default:'default.jpg'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlenght: [8, 'A password must be a least 8 char'],
        // it will not automatically select form db so use .select('+password');
        select: false,
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'guide', 'lead-guide', 'admin'],
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // ONLY WORKS WITH Model.save(), Model.create() not on Model.update()
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not same!',
        },
        select: false, // not necessory cos in middleware we are setting it to undefined so
    },
    passwordChangeAt: {
        type: Date,
        // select: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
    },
});

// USING PRE_SAVE_MIDDLEWARE FOR PASSWORD ENCRYPTION
userSchema.pre('save', async function (next) {
    console.log('This is middleware password encryption....');
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    // i had validated in schema .. ie [password===passwordConfirm]
    this.passwordConfirm = undefined;
    next();
});
// SELECTIN ONLY THOSE USER WHICH AER ACTIVE
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});
// CHANGING PASSWORDAT PROPERTY
userSchema.pre('save', function (next) {
    if (!this.isModified('passwordChangeAt') || this.isNew) return next();
    this.passwordChangeAt = Date.now() - 1000;
    next();
});
// Creating a instace method for check equality of password
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangeAt) {
        const changeTimestamp = parseInt(
            this.passwordChangeAt.getTime() / 1000,
            10
        );
        console.log(JWTTimestamp, this.passwordChangeAt);
        return JWTTimestamp < changeTimestamp;
    }
    return false;
};
// CREATING INSTANCE METHOD FOR CREATING RESET TOKEN;
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log(resetToken);
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
