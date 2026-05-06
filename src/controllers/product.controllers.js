import { uploadFiles } from "../service/storage.service.js"
import productModel from '../models/product.model.js'

export const createProduct = async (req, res) => {
    try {
        const user = req.data;
        const { title, description, type, variants } = req.body;
        const parsedVariants = typeof variants === "string"
            ? JSON.parse(variants)
            : variants;

        const variantsWithImages = await Promise.all(
            parsedVariants.map(async (variant, index) => {
                const files = req.files?.filter(
                    (file) => file.fieldname === `variantImages_${index}`
                ) || [];

                const uploadedImages = await Promise.all(
                    files.map(async (file) => {
                        const image = await uploadFiles(file.buffer, file.originalname);
                        return { url: image.url };
                    })
                );

                return {
                    images: uploadedImages,
                    stock: variant.stock,
                    attributes: variant.attributes,
                    price: {
                        amount: variant.price.amount,
                        currency: variant.price.currency
                    }
                };
            })
        );

        const product = await productModel.create({
            title,
            description,
            seller: user._id,
            type,
            variants: variantsWithImages
        });

        res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
export const getProducts = async (req, res) => {
    try {
        const seller = req.data

        const products = await productModel.find({
            seller: seller._id
        })
        if (!products) return res.status(401), json({
            message: "No products created yet"
        })

        res.status(200).json({
            products
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}
export const deleteProducts = async (req, res) => {
    try {
        const { productId } = req.params;
        await productModel.findByIdAndDelete(productId)
        res.status(200).json({
            message: "Product deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const getAllProducts = async (req, res) => {
    try {
        const product = await productModel.find()
        res.status(200).json({
            product
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const getProductDetails = async (req, res) => {
    const { productId } = req.params
    try {
        const product = await productModel.findOne({
            _id: productId
        })
        res.status(200).json({
            product
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const addProductVariants = async (req, res) => {
    const files = req.files
    const productId = req.params.productId
    let images = null
    const price = req.body.priceAmount
    const stock = req.body.stock
    const attributes = JSON.parse(req.body.attributes || "{}")
    try {

        const product = await productModel.findOne({
            _id: productId,
            seller: req.data._id
        })
        if (files || files.length !== 0) {
            images = (await Promise.all(files.map(async (file) => {
                const image = uploadFiles(file.buffer, file.originalname)
                return image
            })))
        }
        console.log(images.map(image => { return image.url }))
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
        console.log(error)
    }
}

export const editProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await productModel.findOne({
            _id: productId,
            seller: req.data._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const { description, type, title } = req.body;

        const variantsMetadata = JSON.parse(req.body.variantsData || "[]");
        const files = req.files || [];

        const uploadedFilesMap = new Map();
        for (const file of files) {
            const match = file.fieldname.match(/^variantImages_(\d+)$/);
            if (!match) continue;

            const index = Number(match[1]);
            if (!uploadedFilesMap.has(index)) {
                uploadedFilesMap.set(index, []);
            }

            uploadedFilesMap.get(index).push(file);
        }

        const finalVariants = await Promise.all(
            variantsMetadata.map(async (variant, index) => {
                const uploadedVariantFiles = uploadedFilesMap.get(index) || [];

                const uploadedImages = await Promise.all(
                    uploadedVariantFiles.map(async (file) => {
                        const uploaded = await uploadFiles(file.buffer, file.originalname);
                        return { url: uploaded.url };
                    })
                );

                const existingImages = Array.isArray(variant.existingImages)
                    ? variant.existingImages
                          .filter((url) => typeof url === "string" && !url.startsWith("blob:"))
                          .map((url) => ({ url }))
                    : [];

                return {
                    stock: Number(variant.stock || 0),
                    attributes: variant.attributes || {},
                    price: {
                        amount: Number(variant?.price?.amount || 0),
                        currency: variant?.price?.currency || "INR"
                    },
                    images: [...existingImages, ...uploadedImages]
                };
            })
        );

        product.title = title;
        product.description = description;
        product.type = type;
        product.variants = finalVariants;

        await product.save();

        return res.status(200).json({
            message: "Updated successfully",
            product
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params
        const user = req.data

        await productModel.findOneAndDelete({
            _id: productId,
            seller: user._id
        })
        res.status(200).json({
            message: "Product deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
        console.log(error)
    }
}