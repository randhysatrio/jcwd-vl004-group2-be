const { Op } = require("sequelize");
const Crypto = require("crypto");

const Admin = require("../models/Admin");

module.exports = {
  getAdmins: async (req, res) => {
    try {
      const { limit, currentPage, sort } = req.body;

      const { keyword } = req.query;

      const query = {
        limit,
        offset: currentPage * limit - limit,
      };

      if (sort) {
        query.order = [sort.split(",")];
      }

      if (keyword) {
        query.where = {
          [Op.or]: {
            name: {
              [Op.substring]: keyword,
            },
            username: {
              [Op.substring]: keyword,
            },
            address: {
              [Op.substring]: keyword,
            },
          },
        };
      }

      const { rows, count } = await Admin.findAndCountAll(query);

      const totalAdmins = await Admin.count();

      const maxPage = Math.ceil(count / limit);

      res.status(200).send({ rows, count, maxPage, totalAdmins });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  createAdmin: async (req, res) => {
    try {
      const { data, limit } = req.body;

      data.password = Crypto.createHmac("sha1", "hash123")
        .update(data.password)
        .digest("hex");

      const usernameCheck = await Admin.findOne({
        where: { username: data.username },
      });
      const emailCheck = await Admin.findOne({ where: { email: data.email } });

      if (usernameCheck) {
        res.send({ conflict: "This username has already been used!" });
      } else if (emailCheck) {
        res.send({ conflict: "This email has already been registered!" });
      } else {
        await Admin.create(data);

        const rows = await Admin.findAll({ limit });

        const maxPage = Math.ceil(rows / limit);

        const totalAdmins = await Admin.count();

        res
          .status(201)
          .send({
            message: "Admin account created successfully!",
            rows,
            maxPage,
            totalAdmins,
          });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
  deleteAdmin: async (req, res) => {
    try {
      const { limit } = req.body;

      await Admin.destroy({ where: { id: req.params.id } });

      const rows = await Admin.findAll({ limit });

      const maxPage = Math.ceil(rows / limit);

      const totalAdmins = await Admin.count();

      res
        .status(200)
        .send({
          message: "Admin account deleted successfully!",
          rows,
          maxPage,
          totalAdmins,
        });
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
