const Category = require('../models/Category');

module.exports = {
  add: async (req, res) => {
    try {
      const { name } = req.body;

      await Category.create({
        name,
      });

      res.status(201).send('Category created successfully!');
    } catch (err) {
      res.status(500).send(err);
    }
  },
  get: async (req, res) => {
    try {
      const categories = await Category.findAll({});

      res.status(200).send(categories);
    } catch (err) {
      res.status(500).send(err);
    }
  },
  delete: async (req, res) => {
    try {
      await Category.destroy({ where: { id: req.params.id } });

      res.status(200).send('Category deleted successfully!');
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
