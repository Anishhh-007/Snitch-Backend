import productModel from '../models/product.model.js'
import cartModel from '../models/cart.model.js'
import { stockOfVariant } from '../dao/product.dao.js'
import mongoose from 'mongoose';

export const addCart = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const quantityToAdd = Number(req.body.quantity) || 1;
    const userId = req.data._id;


    const product = await productModel.findOne({
      _id : productId,
      'variants._id' : variantId
    });
    if (!product) {
      return res.status(404).json({
        message:   "Product not found"
      });
    }
    

    const stock = await stockOfVariant(productId,variantId);

    if (quantityToAdd > stock) {
      return res.status(400).json({
        message: `Only ${stock} items left in stock`,
      });
    }

    const cart =
      (await cartModel.findOne({ user: userId })) ||
      (await cartModel.create({ user: userId, items: [] }));

    const existingItem = cart.items.find((item) => {
      const sameVariant = String(item.variant ) === String(variantId );
      return  sameVariant;
    });

    if (existingItem) {
      const currentQty = existingItem.quantity;

      if (currentQty + quantityToAdd > stock) {
        return res.status(400).json({
          message: `Only ${stock} items left in stock`,
        });
      }

      existingItem.quantity += quantityToAdd;
      await cart.save();

      return res.status(200).json({
        message: "Cart updated successfully",
      });
    }

    cart.items.push({
      product: productId,
      variant: variantId ,
      quantity: quantityToAdd,
    });

    await cart.save();

    return res.status(200).json({
      message: "Product added to cart successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await cartModel
      .findOne({ user: req.data._id })
      .populate({
        path: "items.product",
        select: "title description type variants",
      });

          const [cartTotalPrice] = await cartModel.aggregate([
  {
    '$match': {
      'user': new mongoose.Types.ObjectId(req.data._id)
    }
  }, {
    '$unwind': {
      'path': '$items'
    }
  }, {
    '$lookup': {
      'from': 'products', 
      'localField': 'items.product', 
      'foreignField': '_id', 
      'as': 'items.product'
    }
  }, {
    '$unwind': {
      'path': '$items.product'
    }
  }, {
    '$unwind': {
      'path': '$items.product.variants'
    }
  }, {
    '$match': {
      '$expr': {
        '$eq': [
          '$items.variant', '$items.product.variants._id'
        ]
      }
    }
  }, {
    '$addFields': {
      'itemPrice': {
        'price': {
          '$multiply': [
            '$items.quantity', '$items.product.variants.price.amount'
          ]
        }, 
        'currency': '$items.product.variants.price.currency'
      }
    }
  }, {
    '$group': {
      '_id': '$_id', 
      'totalPrice': {
        '$sum': '$itemPrice.price'
      }, 
      'currency': {
        '$first': '$itemPrice.currency'
      }
    }
  }
])

    if (!cart) {
      return res.status(404).json({
        message: "No added carts",
      });
    }

    const formattedItems = cart.items.map((item) => {
      const product = item.product?.toObject?.() || item.product;

      const selectedVariant =
        item.variant && Array.isArray(product?.variants)
          ? product.variants.find(
              (variant) => String(variant._id) === String(item.variant)
            )
          : null;

      const productFirstImage = Array.isArray(product?.images)
        ? product.images[0]
        : null;

      const variantFirstImage = selectedVariant?.images?.[0]?.url || null;

      return {
        _id : item?._id,
        productId: product?._id,
        variantId: selectedVariant?._id ,
        title: product?.title,
        description: product?.description,
        quantity: item.quantity,
        totalCartPrice : cartTotalPrice.totalPrice,
        currency : cartTotalPrice.currency,
        images: selectedVariant
          ? variantFirstImage
            ? [variantFirstImage]
            : []
          : productFirstImage
          ? [productFirstImage.url || productFirstImage]
          : [],
        price: selectedVariant?.price || product?.price,
        attributes: selectedVariant?.attributes
          ? Object.fromEntries(selectedVariant.attributes)
          : null,
      };
    });

    return res.status(200).json({
      carts: {
        ...cart.toObject(),
        items: formattedItems,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};



export const deleteCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        
        // Ensure we are comparing ObjectId to ObjectId
        const updatedCart = await cartModel.findOneAndUpdate(
            { user: req.data._id },
            { $pull: { items: { _id: new mongoose.Types.ObjectId(itemId) } } },
            { new: true } 
        );

        if (!updatedCart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        res.status(200).json({
            message: "Item removed successfully",
            cart: updatedCart
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}
export const incrQuantity = async (req, res) => {
    try {
        const { itemId } = req.params;

        // 1. Find the cart first
        const cart = await cartModel.findOne({ 
            user: req.data._id,
            "items._id": itemId 
        });

        if (!cart) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // 2. Find the specific item in the array
        // Use .id() to find the subdocument by its _id
        const item = cart.items.id(itemId);

        // 3. Check stock BEFORE incrementing
        const stock = await stockOfVariant(item.product, item.variant);
        
        if (stock <= item.quantity) {
            return res.status(400).json({
                message: `Only ${stock} items available in stock`
            });
        }

        // 4. Increment and Save
        item.quantity += 1;
        await cart.save();

        res.status(200).json({ 
            message: "Quantity updated successfully", 
            cart 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export const dcrQuantity = async (req, res) => {
    try {
        const { itemId } = req.params;

        // 1. Find the cart and decrement ONLY if quantity is greater than 1
        const updatedCart = await cartModel.findOneAndUpdate(
            { 
                user: req.data._id, 
                "items._id": itemId,
                "items.quantity": { $gt: 1 } // Safety: Prevents quantity from hitting 0
            },
            { 
                $inc: { "items.$.quantity": -1 } 
            },
            {returnDocument: 'after'}
        );

        // 2. If no cart was updated (because it doesn't exist OR quantity was already 1)
        if (!updatedCart) {
            return res.status(400).json({ 
                message: "Cannot decrease further. Use remove to delete item." 
            });
        }

        res.status(200).json({ message: "Quantity decreased", cart: updatedCart });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}