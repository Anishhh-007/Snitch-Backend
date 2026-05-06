import jwt from 'jsonwebtoken'
import {config} from '../config/config.js'
import userModel from '../models/user.model.js'
export const productAuth = async (req , res , next) =>{
    const {token} = req.cookies
    if(!token) {
        return res.status(401).json({message : "Unauthorized"})
    }
    try {
        const decoded = jwt.verify(token , config.JWT_SECRET)

        const user = await userModel.findById(decoded.id)

        if(!user) return res.status(401).json("Unauthorized")

        if(user.role != "seller") {
            return res.status(401).json({
                message : "Forbidden"
            })
        }
        req.data = user
        next()
    } catch (error) {
        res.status(500).json({
            message : error.message
        })
    }
}