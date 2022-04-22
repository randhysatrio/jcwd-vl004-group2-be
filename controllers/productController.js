const { Op } = require("sequelize");
const Product = require("../models/Product");
const Category = require("../models/Category");

module.exports = {
  add: async (req, res) => {
    try {
      console.log(req.file);
      const productData = JSON.parse(req.body.productData);
      await Product.create({
        name: productData.name,
        price_buy: productData.price_buy,
        price_sell: productData.price_sell,
        stock: productData.stock,
        unit: productData.unit,
        volume: productData.volume,
        description: productData.description,
        image: req.file.path,
        appearance: productData.appearance,
        categoryId: productData.categoryId,
        stock_in_unit: productData.stock * productData.volume,
      });

      res.status(201).send("Product created successfully!");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
  all: async (req, res) => {
    try {
      const products = await Product.findAll({ include: Category });

      res.status(200).send(products);
    } catch (err) {
      res.status(500).send(err);
    }
  },
  query: async (req, res) => {
    try {
      console.log("test");
      const {
        name,
        category,
        limit,
        offset,
        appearance,
        sort,
        gte,
        lte,
        between,
      } = req.body;

      const query = {
        limit,
      };

      if (name) {
        query.where = { ...query.where, name: { [Op.substring]: name } };
      }

      if (category) {
        query.where = { ...query.where, categoryId: category };
      }

      if (appearance) {
        query.where = { ...query.where, appearance };
      }

      if (sort) {
        query.order = [sort.split(",")];
      }

      if (gte) {
        query.where = { ...query.where, price_sell: { [Op.gte]: gte } };
      }

      if (lte) {
        query.where = { ...query.where, price_sell: { [Op.lte]: lte } };
      }

      if (between) {
        query.where = { ...query.where, price_sell: { [Op.between]: between } };
      }

      if (offset) {
        query.offset = offset;
      }

      const { count, rows } = await Product.findAndCountAll({
        ...query,
        include: Category,
      });

      res.status(200).send({ products: rows, length: count });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  appearance: async (req, res) => {
    try {
      const appearances = await Product.findAll({
        attributes: ["appearance"],
        group: "appearance",
      });

      res.status(200).send(appearances);
    } catch (err) {
      res.status(500).send(err);
    }
  },
  getProductById: async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id, {
        include: Category,
      });
      res.status(200).send(product);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  edit: async (req, res) => {
    try {
      await Product.update(
        {
          name: productData.name,
          price_buy: productData.price_buy,
          price_sell: productData.price_sell,
          stock: productData.stock,
          unit: productData.unit,
          volume: productData.volume,
          description: productData.description,
          image: productData.image,
          appearance: productData.appearance,
          categoryId: productData.categoryId,
          stock_in_unit: productData.stock * productData.volume,
        },
        {
          where: { id: req.params.id },
        }
      );
      res.status(200).send("Product edited successfully!");
    } catch (error) {
      res.status(500).send(error);
    }
  },
  delete: async (req, res) => {
    try {
      await Product.destroy({ where: { id: req.params.id } });
    } catch {
      res.status(200).send("Product deleted successfully!");
    }
  },
  restore: async (req, res) => {
    try {
      await Product.restore({
        where: { id: req.params.id },
      });
      res.status(200).send("Product recovered successfully!");
    } catch (error) {
      res.status(500).send(error);
    }
  },
  search: async (req, res) => {
    try {
      const { q } = req.query;

      const product = await Product.findAll({
        where: { name: { [Op.like]: "%" + q + "%" } },
        include: Category,
      });
      res.status(200).send(product);
    } catch (error) {
      res.status(500).send(error);
    }
  },
  sort: async (req, res) => {
    try {
      const { q } = req.query;
      const product = await Product.findAll({
        order: [["price_buy", q]],
      });
      res.status(200).send(product);
    } catch (error) {
      res.status(500).send(error);
    }
  },

  getProducts: async (req, res, next) => {
    const { filter, sort, page } = req.query;
    const paramQuerySQL = {};
    let limit;
    let offset;

    // filtering by category
    // if (filter !== "" && typeof filter !== "undefined") {
    //   const query = filter.categoryId.split(",").map((item) => ({
    //     [Op.eq]: item,
    //   }));

    //   paramQuerySQL.where = {
    //     categoryId: { [Op.or]: query },
    //     // include: Category,
    //   };
    // }

    // // sorting
    // if (sort !== "" && typeof sort !== "undefined") {
    //   let query;
    //   if (sort.charAt(0) !== "-") {
    //     query = [[sort, "ASC"]];
    //   } else {
    //     query = [[sort.replace("-", ""), "DESC"]];
    //   }

    //   paramQuerySQL.order = query;
    // }

    // pagination
    if (page !== "" && typeof page !== "undefined") {
      if (page.size !== "" && typeof page.size !== "undefined") {
        limit = page.size;
        paramQuerySQL.limit = limit;
      }

      if (page.number !== "" && typeof page.number !== "undefined") {
        offset = page.number * limit - limit;
        paramQuerySQL.offset = offset;
      }
    } else {
      limit = 5; // limit 5 item
      offset = 0;
      paramQuerySQL.limit = limit;
      paramQuerySQL.offset = offset;
    }

    try {
      const data = await Product.findAll(paramQuerySQL);
      if (data) {
        res.status(200).json({ data });
      }
    } catch (err) {
      next(err);
    }
  },
};
