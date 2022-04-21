const User = require("../models/User");

module.exports = {
  get: async (req, res) => {
    try {
      const users = await User.findAll({});

      res.status(200).send(users);
    } catch (err) {
      res.status(500).send(err);
    }
  },
  status: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (user.active === true) {
        await User.update(
          {
            active: false,
          },
          {
            where: { id: req.params.id },
          }
        );
      } else {
        await User.update(
          {
            active: true,
          },
          {
            where: { id: req.params.id },
          }
        );
      }
      res.status(200).send(user);
    } catch (error) {
      res.status(500).send(error);
    }
  },
  delete: async (req, res) => {
    try {
      await Address.destroy({ where: { id: req.params.id } });

      res.status(200).send("Address deleted successfully!");
    } catch (err) {
      res.status(200).send(err);
    }
  },
};
