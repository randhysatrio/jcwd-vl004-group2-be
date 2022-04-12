const Address = require('../models/Address');

module.exports = {
  add: async (req, res) => {
    try {
      const { address, city, province, country, postalcode, userId } = req.body;

      await Address.create({
        address,
        city,
        province,
        country,
        postalcode,
        userId,
      });

      res.status(201).send('Address created succesfully!');
    } catch (err) {
      res.status(500).send(err);
    }
  },
  get: async (req, res) => {
    try {
      const addresses = await Address.findAll({ where: { userId: req.params.id } });

      res.status(200).send(addresses);
    } catch (err) {
      res.status(500).send(err);
    }
  },
  delete: async (req, res) => {
    try {
      await Address.destroy({ where: { id: req.params.id } });

      res.status(200).send('Address deleted successfully!');
    } catch (err) {
      res.status(200).send(err);
    }
  },
};
