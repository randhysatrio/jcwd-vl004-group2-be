const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

module.exports = {
  add: async (req, res) => {
    try {
      const { productId, userId, quantity } = req.body;

      const userCart = await Cart.findOne({
        where: { userId, productId },
        include: Product,
      });

      if (userCart) {
        if (userCart.quantity + quantity > userCart.product.stock_in_unit) {
          return res.send({
            conflict: true,
            message: `Cannot update this cart item quantity as you already had ${userCart.quantity.toLocaleString(
              'id'
            )} in your cart`,
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
  getCart: async (req, res) => {
    try {
      let page = req.query.page ? req.query.page : 1;
      page = parseInt(page);
      let render = 5;
      let start = (page - 1) * render;
      let end = start + render;

      const count = await Cart.count({
        where: {
          userId: req.params.id,
        },
      });

      const checkoutItems = await Cart.findAll({
        include: [Product],
        where: {
          userId: req.params.id,
          isChecked: true,
        },
      });

      const notCheckedAll = await Cart.count({
        where: {
          userId: req.params.id,
          isChecked: false,
        },
      });

      const response = await User.findOne({
        where: {
          id: req.params.id,
        },
        include: [
          {
            model: Cart,
            include: [Product],
            offset: start,
            limit: end,
          },
        ],
      });

      res.status(200).send({
        cartList: response.carts,
        checkoutItems: checkoutItems,
        isCheckedAll: notCheckedAll ? false : true,
        total_data: count,
        total_page: Math.ceil(count / render),
        active_page: page,
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  deleteCart: async (req, res) => {
    try {
      let { id } = req.params;

      await Cart.destroy({
        where: {
          id,
        },
      });

      res.status(200).send({ message: 'Cart item deleted' });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  updateCart: async (req, res) => {
    try {
      const { quantity, id } = req.body;

      // Update cart quantity
      await Cart.update(
        { quantity },
        {
          where: {
            id,
          },
        }
      );

      res.status(201).send({ message: 'Cart quantity item updated' });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  updateChecked: async (req, res) => {
    try {
      const { isChecked, id } = req.body;

      // Update cart isChecked
      await Cart.update(
        { isChecked },
        {
          where: {
            id,
          },
        }
      );

      res.status(201).send({ message: 'Cart isChecked item updated' });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  updateCheckedAll: async (req, res) => {
    try {
      const { isCheckedAll, userId } = req.body;

      const dataUpdate = await Cart.findAll({
        where: {
          userId,
          isChecked: isCheckedAll,
        },
      });

      await dataUpdate.map((item) => {
        Cart.update(
          { isChecked: !isCheckedAll },
          {
            where: {
              id: item.id,
            },
          }
        );
      });

      res.status(201).send({ message: 'Cart isChecked item updated' });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};
