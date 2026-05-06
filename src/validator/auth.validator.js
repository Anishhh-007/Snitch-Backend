import { body , validationResult } from "express-validator";


const validate = (req , res , next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({
            message : errors.array()[0].msg
        })
    }
    next()
}


export const validateRegister = [
    body("email").isEmail().withMessage("Invalid email address"),
    body("contact").notEmpty().withMessage("Contact is required")
    .matches(/^\d{10}$/).withMessage("Contact must eb a 10-dgit number"),
    body("fullname").notEmpty().withMessage("Full name is required")
    .isLength({min : 3}).withMessage("Full name must be atleast 3 characters long"),
    body("password").notEmpty().isLength({min : 8}).withMessage("Characters should be atleast 8").isLength( {max : 16}).withMessage("Characters should not exceeds length 16"),
    validate
]

export const validateLogin = [
    body("email").isEmail().withMessage("Invalid email address"),
   validate
]