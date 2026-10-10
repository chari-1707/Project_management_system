import "dotenv/config"
import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { randomBytes, createHmac, createHash } from "crypto"
import { create } from "domain"

const UserSchema = new Schema({
    avatar: {
        type: {
            url: String,
            localPath: String
        },
        default: {
            url: `https://placehold.co/200x200`,
            localPath: ""
        }
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    fullName: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: [true, "password is required"]
    },
    isEmailVerified: {
        type: Boolean,
        default: true
    },
    refreshToken: {
        type: String
    },
    forgotPasswordToken: {
        type: String
    },
    forgotPasswordExpiry: {
        type: Date
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpiry: {
        type: Date
    }
}, {
    timestamps: true
})

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    // I only want to run this function when user first time entering and when modifing 
    //means when we are not modifing the password 
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

UserSchema.methods.generateRefreshToken = function () {
    jwt.sign({
        _id: this._id
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY })
}


UserSchema.methods.generateTemporaryToken = function () { //Token without data uses Crypto
    const unHashedToken = randomBytes(256).toString("hex");

    const hashedToken = createHash('sha256').update(salt).digest('hex')

    const tokenExpiry = Date.now() + (20 * 60 * 1000) // 20 mints

    return { unHashedToken, hashedToken, tokenExpiry };
}


export const user = mongoose.model("user", UserSchema);