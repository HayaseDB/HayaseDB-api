const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {join} = require("node:path");
const {readFileSync} = require("node:fs");
const { Schema } = mongoose;

const defaultProfilePicturePath = join(__dirname, '../assets/default_pfp.png');
const defaultProfilePicture = readFileSync(defaultProfilePicturePath);

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: [{ type: String }],
    profilePicture: { type: Buffer, default: defaultProfilePicture },
    isAdmin: { type: Boolean, default: false },
});


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema, 'Users');
