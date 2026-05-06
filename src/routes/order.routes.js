import express from 'express'
import userAuth from '../middleware/auth.middleware.js'
import { createOrder, updateStatus  , getOrders} from '../controllers/order.controllers.js'

const orderRouter = express.Router()

orderRouter.post("/create-order/:variantId/:productId" , userAuth , createOrder)
orderRouter.patch("/update-order/:itemId" , userAuth , updateStatus)
orderRouter.get("/get-orders" , userAuth , getOrders)

export default orderRouter