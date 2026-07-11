import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import db from '../config/db.js'
import dotenv from 'dotenv'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import NodeCache from 'node-cache'

dotenv.config()

const otpCache = new NodeCache({ stdTTL: 300 }) // 5 minutes TTL

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})


export const register = async (req, res) => {
    const { name, phoneNumber, password, pinCode, state, email } = req.body

    if (!name || !phoneNumber || !password || !pinCode || !state || !email) {
        return res.status(400).json({ message: 'Invalid input' })
    }
    try {
        const existingUser = await db.query('SELECT * FROM users WHERE phone = $1 OR email = $2', [phoneNumber, email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists with this phone or email!' })
        }
        const password_hash = await bcrypt.hash(password, 10)
        const newUser = await db.query('INSERT INTO users(name,phone,password_hash,pincode,state,email) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,name,phone,state,pincode,email'
            , [name, phoneNumber, password_hash, pinCode, state, email])
        const token = jwt.sign(
            { userId: newUser.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        )
        return res.status(201).json({ message: 'User registration successful', user: newUser.rows[0], token })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message

        });
    }

}

export const login = async (req, res) => {
    const { phoneNumber, password } = req.body
    if (!phoneNumber || !password) {
        return res.status(400).json({ message: "Invalid input" })
    }
    try {
        const fetchUser = await db.query('SELECT * FROM users WHERE phone = $1', [phoneNumber])
        if (fetchUser.rows.length == 0) {
            return res.status(401).json({ message: "Invalid Credentials!" })
        }
        const user = fetchUser.rows[0]
        const isPasswordValid = await bcrypt.compare(password, user.password_hash)
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid Credentials!" })
        }
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        )
        return res.status(200).json({ message: "Login successful", token, user: { id: user.id, name: user.name, phone: user.phone, pincode: user.pincode, state: user.state } })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }


}

export const forgotPassword = async (req, res) => {
    const { email } = req.body
    if (!email) {
        return res.status(400).json({ message: "Email is required" })
    }
    try {
        const fetchUser = await db.query('SELECT * FROM users WHERE email = $1', [email])
        if (fetchUser.rows.length === 0) {
            return res.status(200).json({ message: "If that email is registered, we have sent an OTP." })
        }
        
        // Generate a 6-digit numeric OTP
        const otp = crypto.randomInt(100000, 1000000).toString()
        
        // Store in node-cache (5 min TTL)
        otpCache.set(`otp:${email}`, { otp, attempts: 0 })
        
        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'FarmSmart Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #15803d; text-align: center;">FarmSmart Password Reset</h2>
                    <p>Hello,</p>
                    <p>You requested a password reset for your FarmSmart account. Please use the following 6-digit One-Time Password (OTP) to proceed. This OTP is valid for 5 minutes.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #15803d; background-color: #f0fdf4; padding: 10px 20px; border-radius: 6px; border: 1px dashed #15803d;">
                            ${otp}
                        </span>
                    </div>
                    <p style="color: #666; font-size: 12px; text-align: center;">If you did not request this, you can safely ignore this email.</p>
                </div>
            `
        }
        
        await transporter.sendMail(mailOptions)
        return res.status(200).json({ message: "If that email is registered, we have sent an OTP." })
    } catch (error) {
        console.error("Forgot password error:", error)
        return res.status(500).json({ message: "An error occurred while sending OTP." })
    }
}

export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" })
    }
    
    const record = otpCache.get(`otp:${email}`)
    if (!record) {
        return res.status(400).json({ message: "OTP expired or never requested" })
    }
    
    if (record.attempts >= 5) {
        otpCache.del(`otp:${email}`)
        return res.status(400).json({ message: "Too many failed attempts. Please request a new OTP." })
    }
    
    if (record.otp !== otp.trim()) {
        record.attempts += 1
        otpCache.set(`otp:${email}`, record)
        return res.status(400).json({ message: `Invalid OTP. Attempts left: ${5 - record.attempts}` })
    }
    
    otpCache.del(`otp:${email}`)
    
    const resetToken = jwt.sign(
        { email, purpose: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
    )
    
    return res.status(200).json({ resetToken, message: "OTP verified successfully" })
}

export const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body
    if (!resetToken || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" })
    }
    try {
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET)
        if (decoded.purpose !== 'password_reset') {
            return res.status(400).json({ message: "Invalid token purpose" })
        }
        
        const password_hash = await bcrypt.hash(newPassword, 10)
        await db.query('UPDATE users SET password_hash = $1 WHERE email = $2', [password_hash, decoded.email])
        
        return res.status(200).json({ message: "Password updated successfully!" })
    } catch (error) {
        console.error("Reset password error:", error)
        return res.status(400).json({ message: "Invalid or expired reset token. Please try again." })
    }
}




