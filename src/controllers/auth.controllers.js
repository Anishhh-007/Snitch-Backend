import userModel from "../models/user.model.js"
import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import bcrypt from 'bcrypt'


export const registerAuth = async (req, res) => {
    try {
        const { email, password, contact, fullname, isSeller } = req.body

        const doesUserExist = await userModel.findOne({
            $or: [
                { email },
                { contact }
            ]
        })
        if (doesUserExist) return res.status(400).json({ message: "User already exists" })

        const hashedPass = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            email,
            password: hashedPass,
            contact,
            fullname,
            role: isSeller ? "seller" : "buyer"
        })

        const token = jwt.sign({
            id: user._id
        },
            config.JWT_SECRET, {
            expiresIn: "7d"
        }
        )
        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Render uses HTTPS, so this MUST be true
            sameSite: 'none', // Required for cross-site cookies
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                contact: user.contact,
                fullname: user.fullname,
                role: user.role,
                email: user.email,
            }
        })
    } catch (error) {
        res.status(500).json({
            message: "Error while registering user",
            err: error.message
        })
    }
}

export const loginAuth = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await userModel.findOne({
            email
        })
        if (!user) return res.status(400).json({ message: "Invalid email or password" })

        const comparePass = await bcrypt.compare(password, user.password)

        if (!comparePass) {
            return res.status(400).json({
                messsage: "Invalid email or password",
            })
        }

        const token = jwt.sign({
            id: user._id,
            fullname: user.fullname,
            email: user.email,
        }, config.JWT_SECRET, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Render uses HTTPS, so this MUST be true
            sameSite: 'none', // Required for cross-site cookies
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })

        res.status(200).json({
            message: 'User loggedin successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                role : user.role
            }
        })

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
}

export const getUser = async (req, res) => {
    try {
        const { _id } = req.data
        const user = await userModel.findOne({
            _id
        })
        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                fullname: user.fullname,
                contact: user.contact || null,
                role: user.role,
                photo: user.photo
            }
        })
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
}

export const googleCallBack = async (req, res) => {
    try {

        const { id, displayName, emails, photos } = req.user
        const email = emails[0].value
        const photo = photos[0].value

        const findUser = await userModel.findOne({
            email
        })

        if (!findUser) {
            const newUser = await userModel.create({
                email,
                fullname: displayName,
                googleId: id,
                photo
            })

            const token = jwt.sign({
                id: newUser._id,
            }, config.JWT_SECRET, { expiresIn: '7d' })

            res.cookie('token', token, {
                httpOnly: true,
                secure: true, // Render uses HTTPS, so this MUST be true
                sameSite: 'none', // Required for cross-site cookies
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            })
        } else {
            const token = jwt.sign({
                id: findUser._id,
            }, config.JWT_SECRET, { expiresIn: '7d' })

            res.cookie('token', token, {
                httpOnly: true,
                secure: true, // Render uses HTTPS, so this MUST be true
                sameSite: 'none', // Required for cross-site cookies
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            })
        }
        res.redirect(`${config.VITE_URI}/auth/google/success?token=${token}`);

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export function logoutAuth  (req, res)  {
  try {
    res.cookie("token", "", {
      expires: new Date(Date.now()),
    })

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    })
  }
}

