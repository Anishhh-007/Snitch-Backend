import jwt from 'jsonwebtoken'
import { config } from '../config/config.js';
import userModel from '../models/user.model.js';
const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("Authentication token missing")
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await userModel.findOne({
           _id : decoded.id
        }).select('-password')
        req.data = user
        next()

    } catch (error) {
        res.status(401).send(error.message)
    }
}

export default userAuth