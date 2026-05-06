import mongoose from "mongoose"
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true

    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true

    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product.variants',
        required: true

    },
    paymentStatus: {
        type: String,
        default : "pending",
        enum: ['pending', 'paid']
    },
    totalAmount: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    }
})

const orderModel = mongoose.model("Order", orderSchema)
export default orderModel