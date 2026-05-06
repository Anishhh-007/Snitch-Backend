import mongoose from "mongoose";


const cartSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required : true
    },
    items : [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
            product : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'product',
                required:true
            },
            variant : {
                type:mongoose.Schema.Types.ObjectId,
                ref : "product.variants"
            },
            quantity : {
                type : Number,
                default : 1
            }
        }
    ]
})

const cartModel = mongoose.model('cart' , cartSchema)
export default cartModel