const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String, 
            required: [true, 'user name required'],
            trim: true,
            minlength:[3,'too short user name'],
            maxlength:[32,'too long user name']
        },
        slug:{
            type: String,
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, 'user email required'],
            unique: [true, 'email must be unique'],
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
        },
        password: {
            type: String,
            required: [true, 'user password required'],
            minlength:[8,'Password must be at least 8 characters'],
            select: false // Don't return password in query results
        },
        // passwordConfirm: {
        //     type: String,
        //     // required: [true, 'user passwordConfirm required'],
        //     validate: {
        //         // This validator only works on CREATE and SAVE
        //         validator: function(val) {
        //             return val === this.password;
        //         },
        //         message: 'Passwords do not match'
        //     }
        // },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        role: {
            type: String,
            enum: ['user', 'manager','admin'],
            default: 'user',
        },
        phone: {
            type: String,
            validate: {
                validator: function(v) {
                    // Validate E.164 format
                    return /^\+[1-9]\d{1,14}$/.test(v);
                },
                message: props => `${props.value} is not a valid phone number in E.164 format!`
            }
        },
        image: {
            type: String,
            default: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/users/profiles/default-user.png'
        },
        active: {
            type: Boolean,
            default: true
        },
        deactivatedAt: Date,
        googleId: {
            type: String,
        },
        facebookId: {
            type: String,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Document middleware: runs before .save() and .create(), but not on .update()
userSchema.pre('save', async function(next) { // .save() and .create()
    // Only run this function if password was modified
    if (!this.isModified('password')) return next();
    
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    
    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    
    next();
});

// Update passwordChangedAt property when password is changed
userSchema.pre('save', function(next) { // .save() and .create()
    if (!this.isModified('password') || this.isNew) return next();
    
    // Set passwordChangedAt to current time minus 1 second
    // This ensures the token is created after the password has been changed
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// Format phone to E.164 if it's not already
userSchema.pre('save', function(next) {
    // Only run this function if phone was modified
    if (!this.isModified('phone')) return next();
    
    // Format phone to E.164 if it's not already
    if (this.phone && !this.phone.startsWith('+')) {
        // Simple formatting - you might want to use the utility function instead
        this.phone = '+' + this.phone.replace(/[^\d]/g, '');
    }
    
    next();
});

// Query middleware: Only find active users by default
userSchema.pre(/^find/, function(next) {
    // this points to the current query
    // Only exclude inactive users if not explicitly querying for them
    if (!this._conditions.hasOwnProperty('active')) {
        this.find({ active: { $ne: false } });
    }
    next();
});

// Instance method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if user changed password after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    
    // False means NOT changed
    return false;
};

// Create model
const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
