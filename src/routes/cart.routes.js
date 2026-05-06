import express from 'express'
import { addCart  , getCart , deleteCart , incrQuantity , dcrQuantity} from '../controllers/cart.controllers.js'
import userAuth from '../middleware/auth.middleware.js'
const cartRouter = express.Router()

cartRouter.post('/add-items/:productId/:variantId' , userAuth , addCart )
cartRouter.get('/get' , userAuth , getCart)
cartRouter.delete('/delete/:itemId' , userAuth , deleteCart)
cartRouter.patch('/increment/:itemId' , userAuth , incrQuantity)
cartRouter.patch('/decrement/:itemId' , userAuth , dcrQuantity)

export default cartRouter