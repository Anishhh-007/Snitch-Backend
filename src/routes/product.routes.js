
import express from'express'
import { productAuth } from '../middleware/product.middleware.js'
import { addProductVariants, createProduct, deleteProducts, getAllProducts, getProductDetails, getProducts  , editProduct , deleteProduct} from '../controllers/product.controllers.js'
import multer from 'multer'


const upload = multer({
    storage : multer.memoryStorage(),
    limits : {
        fileSize : 9* 1024  * 1024
    }
})
const productRouter = express.Router()
productRouter.post("/create-products" , productAuth ,upload.any(), createProduct)
productRouter.get("/get-products" , productAuth , getProducts  )
productRouter.delete("/delete-products/:productId" , productAuth , deleteProducts  )
productRouter.get("/get-all" , getAllProducts)
productRouter.get("/get-product/:productId" , getProductDetails)
productRouter.put("/update-product/:productId", productAuth, upload.any(), editProduct);
productRouter.delete('/delete-product/:productId' , productAuth , deleteProduct)
export default productRouter