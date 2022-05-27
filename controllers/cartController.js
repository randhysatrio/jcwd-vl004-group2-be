const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Category = require('../models/Category');
const sequelize = require('../configs/sequelize');
const { Op } = require('sequelize');

const getNewCart = async (page, userId, res, message) => {
  let render = 5;
  let start = (page - 1) * render;

  // find qty > stock in volume
  const stockChanged = await Cart.findAll({
    where: {
      userId,
      quantity: {
        [Op.gt]: sequelize.col('product.stock_in_unit'),
      },
      '$product.stock_in_unit$': { [Op.not]: 0 },
    },
    include: [{ model: Product, attributes: ['stock_in_unit'] }],
  });

  // update quantity if qty > stock in volume
  for (let i = 0; i < stockChanged.length; i++) {
    stockChanged[i].quantity = stockChanged[i].product.stock_in_unit;
    stockChanged[i].isChecked = false;
    await stockChanged[i].save();
  }

  // find stock in volume 0 or deleted
  const notAvailable = await Cart.findAll({
    where: {
      userId,
      [Op.or]: {
        '$product.stock_in_unit$': 0,
        '$product.deletedAt$': { [Op.not]: null },
      },
    },
    include: [{ model: Product, paranoid: false }],
  });

  // get checkout items
  const checkoutItems = await Cart.findAll({
    where: {
      userId,
      isChecked: true,
      '$product.stock_in_unit$': { [Op.not]: 0 },
      '$product.deletedAt$': null,
    },
    include: [{ model: Product, paranoid: false }],
  });

  // get cart data with limit & count all cart
  const { count, rows } = await Cart.findAndCountAll({
    where: {
      userId,
      '$product.stock_in_unit$': { [Op.not]: 0 },
      '$product.deletedAt$': null,
    },
    include: [{ model: Product, paranoid: false }],
    offset: start,
    limit: render,
    order: [['createdAt', 'DESC']],
  });

  res.status(200).send({
    cartList: rows,
    checkoutItems,
    notAvailable,
    isCheckedAll: checkoutItems.length === count,
    cartTotal: count,
    total_page: Math.ceil(count / render),
    active_page: page,
    message,
  });
};

module.exports = {
  add: async (req, res) => {
    try {
      const { productId, userId, quantity } = req.body;

      const productData = await Product.findByPk(productId, {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: { model: Category, attributes: ['name'] },
        paranoid: false,
      });

      if (productData.deletedAt) {
        return res.send({
          deleted: true,
          message: `This product has already been removed from store!`,
        });
      }

      if (productData.stock_in_unit < quantity) {
        return res.send({
          conflict: true,
          message: `Current stock insufficient!`,
          productData,
        });
      }

      const userCart = await Cart.findOne({
        where: { userId, productId },
        attributes: ['id', 'quantity'],
      });

      if (userCart) {
        if (userCart.quantity + quantity > productData.stock_in_unit) {
          return res.send({
            conflict: true,
            message: `Cannot update this item quantity as you already had ${userCart.quantity.toLocaleString('id')}${
              productData.unit
            } in your cart`,
            productData,
          });
        } else {
          await Cart.increment({ quantity }, { where: { id: userCart.id } });

          res.status(200).send({ message: 'Updated this item quantity!', productData });
        }
      } else {
        await Cart.create({ userId, productId, quantity });

        const cartTotal = await Cart.count({ where: { userId } });

        res.status(201).send({ message: 'Added this item to your cart!', productData, cartTotal });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
  getCart: async (req, res) => {
    try {
      let page = req.query.page ? parseInt(req.query.page) : 1;
      getNewCart(page, req.user.id, res);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  getTotal: async (req, res) => {
    try {
      const count = await Cart.count({
        where: {
          userId: req.user.id,
        },
      });

      res.status(200).send({
        cartTotal: count,
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  deleteCart: async (req, res) => {
    try {
      let { id } = req.params;
      let page = req.query.page ? parseInt(req.query.page) : 1;

      // delete cart item
      await Cart.destroy({
        where: {
          id,
        },
      });

      // return new cart data
      getNewCart(page, req.user.id, res, 'Item deleted');
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  updateCart: async (req, res) => {
    try {
      const { quantity, id } = req.body;
      let page = req.query.page ? parseInt(req.query.page) : 1;

      // Update cart quantity
      await Cart.update(
        { quantity },
        {
          where: {
            id,
          },
        }
      );

      // return new cart data
      getNewCart(page, req.user.id, res, 'Quantity item updated');
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  updateChecked: async (req, res) => {
    try {
      const { isChecked, id } = req.body;
      let page = req.query.page ? parseInt(req.query.page) : 1;

      // Update cart isChecked
      await Cart.update(
        { isChecked },
        {
          where: {
            id,
          },
        }
      );

      // return new cart data
      getNewCart(page, req.user.id, res, 'isChecked item updated');
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  updateCheckedAll: async (req, res) => {
    try {
      const { isCheckedAll } = req.body;
      let page = req.query.page ? parseInt(req.query.page) : 1;

      await Cart.update(
        { isChecked: !isCheckedAll },
        {
          where: {
            userId: req.user.id,
            isChecked: isCheckedAll,
          },
        }
      );

      // return new cart data
      getNewCart(page, req.user.id, res, 'isChecked item updated');
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};
