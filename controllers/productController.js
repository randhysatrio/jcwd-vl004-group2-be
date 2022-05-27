const { Op } = require('sequelize');
const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs');
const sequelize = require('../configs/sequelize');

module.exports = {
  add: async (req, res) => {
    try {
      let productData = JSON.parse(req.body.productData);
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

      res.status(201).send('Product created successfully!');
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
      const {
        keyword,
        category,
        limit,
        offset,
        appearance,
        gte,
        lte,
        between,
        fromHome,
        fromAllProducts,
        fromHomeAdmin,
        fromDashboardAdmin,
        sort,
      } = req.body;

      const query = {
        limit,
      };

      const { search } = req.query;

      if (category !== 'all') {
        if (category) {
          const categoryData = await Category.findOne({
            where: { name: category },
            attributes: ['id'],
          });
          query.where = { ...query.where, categoryId: categoryData.id };
        }
      }

      if (keyword) {
        query.where = {
          ...query.where,
          [Op.or]: {
            name: { [Op.substring]: keyword },
            appearance: { [Op.substring]: keyword },
            '$category.name$': { [Op.substring]: keyword },
          },
        };
      }

      if (search) {
        query.where = {
          ...query.where,
          [Op.or]: {
            name: { [Op.substring]: search },
            appearance: { [Op.substring]: search },
            '$category.name$': { [Op.substring]: search },
          },
        };
      }

      if (appearance) {
        query.where = { ...query.where, appearance };
      }

      if (sort) {
        if (sort === 'total_sales,ASC') {
          query.order = [[sequelize.literal('total_sales'), 'ASC']];
        } else if (sort === 'total_sales,DESC') {
          query.order = [[sequelize.literal('total_sales'), 'DESC']];
        } else {
          query.order = [sort.split(',')];
        }
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

      const data = {
        ...query,
        attributes: [
          'id',
          'name',
          'price_buy',
          'price_sell',
          'stock',
          'unit',
          'volume',
          'stock_in_unit',
          'description',
          'image',
          'appearance',
          [sequelize.literal(`(SELECT COUNT(*) FROM reviews WHERE reviews.productId = product.id)`), 'totalReviews'],
          [sequelize.literal(`(SELECT AVG(reviews.rating) FROM reviews WHERE reviews.productId = product.id)`), 'avgRating'],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM invoiceitems AS invoiceitem JOIN invoiceheaders AS invoiceheader ON invoiceheader.id = invoiceitem.invoiceheaderId WHERE invoiceheader.status = 'approved' AND invoiceitem.productId = product.id)`
            ),
            'total_sales',
          ],
          ,
        ],
      };

      if (fromHome) {
        data.attributes = [
          'id',
          'name',
          'image',
          'price_sell',
          'stock_in_unit',
          'volume',
          'unit',
          [sequelize.literal(`(SELECT COUNT(*) FROM reviews WHERE reviews.productId = product.id)`), 'totalReviews'],
          [sequelize.literal(`(SELECT AVG(reviews.rating) FROM reviews WHERE reviews.productId = product.id)`), 'avgRating'],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM invoiceitems AS invoiceitem JOIN invoiceheaders AS invoiceheader ON invoiceheader.id = invoiceitem.invoiceheaderId WHERE invoiceheader.status = 'approved' AND invoiceitem.productId = product.id)`
            ),
            'total_sales',
          ],
        ];
      }

      if (fromAllProducts) {
        data.attributes = [
          'id',
          'name',
          'image',
          'description',
          'price_sell',
          'stock',
          'stock_in_unit',
          'volume',
          'unit',
          [sequelize.literal(`(SELECT COUNT(*) FROM reviews WHERE reviews.productId = product.id)`), 'totalReviews'],
          [sequelize.literal(`(SELECT AVG(reviews.rating) FROM reviews WHERE reviews.productId = product.id)`), 'avgRating'],
        ];
        data.include = [{ model: Category, attributes: ['name'] }];
      }

      if (fromDashboardAdmin) {
        data.attributes = [
          'id',
          'name',
          'price_buy',
          'price_sell',
          'stock',
          'unit',
          'volume',
          'stock_in_unit',
          'image',
          'appearance',
          [sequelize.literal(`(SELECT COUNT(*) FROM reviews WHERE reviews.productId = product.id)`), 'totalReviews'],
          [sequelize.literal(`(SELECT AVG(reviews.rating) FROM reviews WHERE reviews.productId = product.id)`), 'avgRating'],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM invoiceitems AS invoiceitem JOIN invoiceheaders AS invoiceheader ON invoiceheader.id = invoiceitem.invoiceheaderId WHERE invoiceheader.status = 'approved' AND invoiceitem.productId = product.id)`
            ),
            'total_sales',
          ],
        ];
        data.include = [{ model: Category, attributes: ['name'] }];
      }

      if (fromHomeAdmin) {
        data.attributes = ['id', 'name'];
        data.order = [['createdAt', 'DESC']];
      }

      const { count, rows } = await Product.findAndCountAll(data);

      res.status(200).send({ products: rows, length: count });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  appearance: async (req, res) => {
    try {
      const appearances = await Product.findAll({
        attributes: ['appearance'],
        group: 'appearance',
      });

      res.status(200).send(appearances);
    } catch (err) {
      res.status(500).send(err);
    }
  },
  getProductById: async (req, res) => {
    try {
      const { withRelated, limit } = req.body;

      const product = await Product.findByPk(req.params.id, {
        attributes: [
          'id',
          'name',
          'price_buy',
          'price_sell',
          'price_buy',
          'stock',
          'volume',
          'unit',
          'stock_in_unit',
          'description',
          'image',
          'appearance',
          'categoryId',
          [sequelize.literal(`(SELECT COUNT(*) FROM reviews WHERE reviews.productId = product.id)`), 'totalReviews'],
          [sequelize.literal(`(SELECT AVG(reviews.rating) FROM reviews WHERE reviews.productId = product.id)`), 'avgRating'],
        ],
        include: { model: Category, attributes: ['id', 'name'] },
      });

      const result = {
        product,
      };

      if (product) {
        if (withRelated) {
          const relatedProducts = await Product.findAll({
            where: { categoryId: product.categoryId },
            attributes: [
              'id',
              'name',
              'image',
              'price_sell',
              'stock_in_unit',
              'volume',
              'unit',
              [sequelize.literal(`(SELECT COUNT(*) FROM reviews WHERE reviews.productId = product.id)`), 'totalReviews'],
              [sequelize.literal(`(SELECT AVG(reviews.rating) FROM reviews WHERE reviews.productId = product.id)`), 'avgRating'],
            ],
            limit,
          });

          result.relatedProducts = relatedProducts.filter((related) => related.id !== product.id);
        }
      }

      res.status(200).send(result);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  edit: async (req, res) => {
    try {
      let productData = JSON.parse(req.body.productData);
      let oldData = await Product.findByPk(req.params.id);

      // stock concept
      // repack sisa = remaining stock / new volume
      //1. stock = new stock + repack sisa
      // 2. stock in unit = stock x volume

      if (productData.volume !== oldData.volume && productData.stock !== oldData.stock) {
        productData = {
          ...productData,
          stock: productData.stock + Math.floor((oldData.stock_in_unit - oldData.stock * oldData.volume) / productData.volume),
          stock_in_unit: productData.stock * productData.volume + (oldData.stock_in_unit - oldData.stock * oldData.volume),
        };
      } else if (productData.volume !== oldData.volume) {
        productData.stock = Math.floor(oldData.stock_in_unit / productData.volume);
      } else if (productData.stock !== oldData.stock) {
        productData.stock_in_unit = productData.stock * productData.volume + (oldData.stock_in_unit - oldData.stock * oldData.volume);
      }

      if (req.file) {
        // edit is different from add need to update the path
        productData = { ...productData, image: req.file.path };
      }
      await Product.update(productData, {
        where: { id: req.params.id },
      });
      // delete oldfile and replace it with a new photo
      if (req.file) {
        fs.unlinkSync(oldData.image);
      }
      res.status(200).send('Product edited successfully!');
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
  delete: async (req, res) => {
    try {
      await Product.destroy({ where: { id: req.params.id } });

      res.status(200).send('Product deleted successfully!');
    } catch (err) {
      res.status(500).send(err);
    }
  },
  restore: async (req, res) => {
    try {
      await Product.restore({
        where: { id: req.params.id },
      });
      res.status(200).send('Product recovered successfully!');
    } catch (error) {
      res.status(500).send(error);
    }
  },
};
