import { config } from "../config/config.js"
import orderModel from "../models/order.model.js"
import crypto from 'crypto'

export const createOrder= async (req , res) => {
    const{variantId , productId} = req.params
    const{price , access} = req.body
    try {

        const doesOrderExists = await orderModel.findOne({
            user : req.data._id,
            variantId ,
            productId
        })
        if(doesOrderExists && access != "granted") {
           if (doesOrderExists.paymentStatus === 'pending'){
            return res.status(400).json({message : "Complete payment for this product first" , succss : false})
           }
        }
        if(doesOrderExists){
           return res.status(200).json({message : ""})
        }

      const order =   await orderModel.create({
            user : req.data._id,
            productId,
            variantId,
            paymentStatus : 'pending',
            quantity :  1,
            totalAmount :price
        })
        res.status(201).json({
            message  :"Order created successfully"
        })
    } catch (error) {
        res.status(500).json({
            message : error.message
        })
        console.log(error.message)
    }
}
export const updateStatus= async (req , res) => {
    const{variantid , productId} = req.params
    try {
         await orderModel.findOneAndUpdate({
            user : req.data._id,
            productId,
            variantid,
            paymentStatus : 'pending',
        
        }, {
            paymentStatus : 'paid'
        } , {returnDocument : 'after'})

        res.status(200).json({
            message : "Order placed successfully"
        })
    } catch (error) {
        res.status(500).json({
            message : error.message
        })
    }
}

export const deleteOrder = async (req , res) => {
    const{orderId} = req.params
    try {
        await orderModel.findOneAndDelete({_id : orderId})
    } catch (error) {
          res.status(500).json({
            message : error.message
        })
    }
}

export const getOrders = async (req , res) => {
    try {
        const orders = await orderModel.find({
            user : req.data._id
        }).populate("productId" )

        res.status(200).json({
             orders
        })
    } catch (error) {
            res.status(500).json({
            message : error.message
        })
    }
}

