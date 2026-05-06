import mongoose from "mongoose";
import bcrypt from 'bcrypt'
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    contact: {
        type: String,
    },

    fullname: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["buyer", "seller"],
        default: "buyer"

    },
    googleId: {
        type: String
    },
    photo: {
        type: String,
        required: false
    },
     password: {
        type: String,
        required: function() {
            return !this.googleId
        },
    }

})

const userModel = mongoose.model("user", userSchema)

export default userModel