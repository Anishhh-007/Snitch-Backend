import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    type : {
        type : String,
        enum : ["tops","bottoms" , "shoes","accessories"]
    } ,
    variants : [
        {
            images: [
                {url : String} ,
            ],
            stock : {
                type : Number,
                required : true
            },
            attributes : {
                type : Map,
                of : String
            },
            price : {
                amount : Number,
                currency : String
            },
        
        }
    ]
})


const productModel = mongoose.model("product", productSchema)
export default productModel