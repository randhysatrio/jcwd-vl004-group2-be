const Cart = require('../models/Cart');
const Product = require('../models/Product');

module.exports = {
  add: async (req, res) => {
    try {
      const { productId, userId, quantity } = req.body;

      const userCart = await Cart.findOne({ where: { userId, productId }, include: Product });

      if (userCart) {
        if (userCart.quantity + quantity > userCart.product.stock_in_unit) {
          return res.send({
            conflict: true,
            message: `Cannot update this cart item quantity as you already had ${userCart.quantity} in your cart`,
          });
        } else {
          userCart.quantity = userCart.quantity + quantity;

          await userCart.save();

          res.status(200).send('Updated cart item quantity!');
        }
      } else {
        await Cart.create({ userId, productId, quantity });

        res.status(201).send('Added this item to your cart!');
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
