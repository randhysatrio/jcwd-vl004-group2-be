const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

module.exports = {
  add: async (req, res) => {
    try {
      const { productId, userId, quantity } = req.body;

      const productData = await Product.findByPk(productId);

      if (productData.deletedAt) {
        return res.send({
          conflict: true,
          message: `This product has already been removed from store!`,
        });
      }

      const userCart = await Cart.findOne({
        where: { userId, productId },
        include: Product,
      });

      if (userCart) {
        if (userCart.quantity + quantity > userCart.product.stock_in_unit) {
          return res.send({
            conflict: true,
            message: `Cannot update this cart item quantity as you already had ${userCart.quantity.toLocaleString('id')} ${
              userCart.product.unit
            } in your cart`,
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
    // try {
    //   const { isCheckedAll, userId } = req.body;
    //   const dataUpdate = await Cart.findAll({
    //     where: {
    //       userId,
    //       isChecked: isCheckedAll,
    //     },
    //   });
    //   await dataUpdate.map((item) => {
    //     Cart.update(
    //       { isChecked: !isCheckedAll },
    //       {
    //         where: {
    //           id: item.id,
    //         },
    //       }
    //     );
    //   });
    //   res.status(201).send({ message: 'Cart isChecked item updated' });
    // } catch (error) {
    //   res.status(500).send({ message: error.message });
    // }
  },
  RSgetUserCartItems: async (req, res) => {
    try {
      const cartItems = await Cart.findAll({ where: { userId: req.params.id }, include: Product });

      const conflictItems = cartItems.filter((cart) => cart.quantity > cart.product.stock_in_unit);

      if (conflictItems.length) {
        const conflictItemsId = conflictItems.map((item) => item.id);

        await Cart.update({ isChecked: false }, { where: { id: conflictItemsId } });

        const updatedCartItems = await Cart.findAll({ where: { userId: req.params.id }, include: Product });

        const checkoutItems = updatedCartItems.filter((item) => item.isChecked === true);

        res.status(200).send({
          conflict_msg: true,
          cartItems: updatedCartItems,
          checkoutItems,
        });
      } else {
        const checkoutItems = cartItems.filter((item) => item.isChecked === true);

        res.status(200).send({ conflict_msg: '', cartItems, checkoutItems });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
  RScheckedAll: async (req, res) => {
    try {
      const cartItems = await Cart.findAll({ where: { userId: req.params.id }, include: Product });

      const clearedItems = cartItems.filter((item) => item.quantity <= item.product.stock_in_unit);

      const clearedItemsId = clearedItems.map((item) => item.id);

      await Cart.update(req.body, { where: { id: clearedItemsId } });

      const updatedCartItems = await Cart.findAll({ where: { userId: req.params.id }, include: Product });

      const checkoutItems = updatedCartItems.filter((item) => item.isChecked === true);

      res.status(200).send({ cartItems: updatedCartItems, checkoutItems });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  RScheckedOne: async (req, res) => {
    try {
      const { isChecked, userId } = req.body;

      await Cart.update({ isChecked }, { where: { id: req.params.id } });

      const cartItems = await Cart.findAll({ where: { userId }, include: Product });

      const checkoutItems = cartItems.filter((item) => item.isChecked === true);

      res.status(200).send({ cartItems, checkoutItems });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  RSdelete: async (req, res) => {
    try {
      const { userId } = req.body;

      await Cart.destroy({ where: { id: req.params.id } });

      const cartItems = await Cart.findAll({ where: { userId }, include: Product });

      const conflictItems = cartItems.filter((cart) => cart.quantity > cart.product.stock_in_unit);

      if (conflictItems.length) {
        const conflictItemsId = conflictItems.map((item) => item.id);

        await Cart.update({ isChecked: false }, { where: { id: conflictItemsId } });

        const updatedCartItems = await Cart.findAll({ where: { userId }, include: Product });

        const checkoutItems = updatedCartItems.filter((item) => item.isChecked === true);

        res.status(200).send({
          cartItems: updatedCartItems,
          checkoutItems,
        });
      } else {
        const checkoutItems = cartItems.filter((item) => item.isChecked === true);

        res.status(200).send({ cartItems, checkoutItems });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
  RSupdate: async (req, res) => {
    try {
      const { quantity, userId } = req.body;

      await Cart.update({ quantity: quantity }, { where: { id: req.params.id } });

      const cartItems = await Cart.findAll({ where: { userId }, include: Product });

      const conflictItems = cartItems.filter((cart) => cart.quantity > cart.product.stock_in_unit);

      if (conflictItems.length) {
        const conflictItemsId = conflictItems.map((item) => item.id);

        await Cart.update({ isChecked: false }, { where: { id: conflictItemsId } });

        const updatedCartItems = await Cart.findAll({ where: { userId }, include: Product });

        const checkoutItems = updatedCartItems.filter((item) => item.isChecked === true);

        res.status(200).send({
          cartItems: updatedCartItems,
          checkoutItems,
        });
      } else {
        const checkoutItems = cartItems.filter((item) => item.isChecked === true);

        res.status(200).send({ cartItems, checkoutItems });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
  RSfinalCheck: async (req, res) => {
    try {
      // const checkoutItemsId = req.body.checkoutItems.map((item) => item.id);

      const checkoutItemsData = await Cart.findAll({ where: { userId: req.body.userId, isChecked: true }, include: Product });

      console.log(checkoutItemsData);

      console.log(checkoutItemsData.some((item) => item.quantity > item.product.stock_in_unit));

      if (checkoutItemsData.some((item) => item.quantity > item.product.stock_in_unit)) {
        const checkoutItemsId = checkoutItemsData.map((item) => item.id);

        await Cart.update({ isChecked: false }, { where: { id: checkoutItemsId } });

        const cartItems = await Cart.findAll({ where: { userId: req.body.userId }, include: Product });

        const checkoutItems = cartItems.filter((item) => item.isChecked === true);

        res.send({
          not_allowed: true,
          msg: 'We cannot continue your checkout process due to one or more items insufficient stock',
          cartItems,
          checkoutItems,
        });
      } else {
        res.status(200).send({ allowed: true });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};
