import { generateResponse } from "../service/ai.service.js"

export const negociate = async (req , res) => {
    const {messages , details} = req.body
    try {
        const response = await generateResponse(messages , details)
        res.status(200).json({
            response
        })
    } catch (error) {
        res.status(500).json({
            message : error.message
        })
    }
}