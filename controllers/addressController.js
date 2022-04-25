const Address = require('../models/Address');

module.exports = {
  add: async (req, res) => {
    try {
      const { address, city, province, country, postalcode, is_default } = req.body;

      const currentDefault = await Address.findOne({ where: { is_default: true, userId: req.user.id } });

      if (is_default && currentDefault) {
        currentDefault.is_default = false;

        await currentDefault.save();
      }

      await Address.create({
        address,
        city,
        province,
        country,
        postalcode,
        userId: req.user.id,
        is_default,
      });

      const addresses = await Address.findAll({ where: { userId: req.user.id } });

      res.status(201).send({ message: 'Address created successfully!', addresses });
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
  get: async (req, res) => {
    try {
      const addresses = await Address.findAll({ where: { userId: req.user.id } });

      res.status(200).send(addresses);
    } catch (err) {
      res.status(500).send(err);
    }
  },
  delete: async (req, res) => {
    try {
      await Address.destroy({ where: { id: req.params.id } });

      const addresses = await Address.findAll({ where: { userId: req.user.id } });

      res.status(200).send({ message: 'Address deleted successfully!', addresses });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  update: async (req, res) => {
    try {
      const currentDefault = await Address.findOne({ where: { is_default: true, userId: req.user.id } });

      await Address.update({ is_default: true }, { where: { id: req.params.id } });

      if (currentDefault) {
        currentDefault.is_default = false;

        await currentDefault.save();
      }

      const addresses = await Address.findAll({ where: { userId: req.user.id } });

      res.status(200).send(addresses);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
  edit: async (req, res) => {
    try {
      await Address.update(req.body.values, { where: { id: req.params.id } });

      const addresses = await Address.findAll({ where: { userId: req.body.userId } });

      res.status(200).send({ message: 'Address updated successfully', addresses });
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
