const { Op } = require("sequelize");
const Product = require("../models/Product");
const Category = require("../models/Category");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: "1000000" },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb("Give proper files formate to upload");
  },
}).single("image");

module.exports = {
  upload,
  add: async (req, res) => {
    try {
      await Product.create({
        name: req.body.name,
        price_buy: req.body.price_buy,
        price_sell: req.body.price_sell,
        stock: req.body.stock,
        unit: req.body.unit,
        volume: req.body.volume,
        description: req.body.description,
        image: req.file.path,
        appearance: req.body.appearance,
        categoryId: req.body.categoryId,
        stock_in_unit: req.body.stock * req.body.volume,
      });

      res.status(201).send("Product created successfully!");
    } catch (err) {
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
          name: req.body.name,
          price_buy: req.body.price_buy,
          price_sell: req.body.price_sell,
          stock: req.body.stock,
          unit: req.body.unit,
          volume: req.body.volume,
          description: req.body.description,
          image: req.body.image,
          appearance: req.body.appearance,
          categoryId: req.body.categoryId,
          stock_in_unit: req.body.stock * req.body.volume,
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
};
