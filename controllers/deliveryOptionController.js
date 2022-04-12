const DeliveryOption = require('../models/DeliveryOption');

module.exports = {
  add: async (req, res) => {
    try {
      const { name, cost } = req.body;

      await DeliveryOption.create({
        name,
        cost,
      });

      res.status(201).send('Delivery option created successfully!');
    } catch (err) {
      res.status(500).send(err);
    }
  },
  get: async (req, res) => {
    try {
      const deliveryoptions = await DeliveryOption.findAll({});

      res.status(200).send(deliveryoptions);
    } catch (err) {
      res.status(500).send(err);
    }
  },
  delete: async (req, res) => {
    try {
      await DeliveryOption.destroy({ where: { id: req.params.id } });

      res.status(200).send('Delivery option deleted!');
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
