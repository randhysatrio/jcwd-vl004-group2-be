require("dotenv").config();
const User = require("../models/User");
const Product = require("../models/Product");
const { Op } = require("sequelize");
const fs = require("fs");
const Crypto = require("crypto");

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
      const updatedUser = await User.findByPk(req.params.id);
      res.status(200).send(updatedUser.active);
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
  query: async (req, res) => {
    try {
      const { active, limit, offset, sort } = req.body;

      const query = {
        limit,
      };

      const { keyword } = req.query;

      if (keyword) {
        query.where = {
          ...query.where,
          [Op.or]: {
            name: { [Op.substring]: keyword },
            email: { [Op.substring]: keyword },
            phone_number: { [Op.substring]: keyword },
          },
        };
      }

      if (sort) {
        query.order = [sort.split(",")];
      }

      if (offset) {
        query.offset = offset;
      }

      if (active) {
        query.where = { ...query.where, active: active };
      }

      const { count, rows } = await User.findAndCountAll({ ...query });

      res.status(200).send({ users: rows, length: count });
    } catch (err) {
      // console.log(err) to inform the error in the console
      console.log(err);
      res.status(500).send(err);
    }
  },
  findById: async (req, res) => {
    try {
      const { id } = req.user;

      const user = await User.findByPk(id);

      res.status(200).send(user);
    } catch (err) {
      res.status(500).send(err);
    }
  },
  updateProfile: async (req, res) => {
    try {
      const { id } = req.user;

      const data = JSON.parse(req.body.data);

      const currentData = await User.findByPk(id);

      const dataToUpdate = {};

      for (const key in data) {
        if (!data[key]) {
          continue;
        } else if (data[key] === currentData[key]) {
          continue;
        } else {
          dataToUpdate[key] = data[key];
        }
      }

      if (dataToUpdate.username) {
        const usernamecheck = await User.findOne({
          where: { username: dataToUpdate.username },
        });

        if (usernamecheck) {
          return res.send({
            conflict: true,
            message: "This username has already been taken",
          });
        }
      }

      if (req.file) {
        dataToUpdate.profile_picture = req.file.path;
      }

      await User.update(dataToUpdate, { where: { id } });

      if (req.file) {
        if (
          currentData.profile_picture !== "public/images/profile/default.png"
        ) {
          fs.unlinkSync(currentData.profile_picture);
        }
      }

      const updatedData = await User.findByPk(id);

      res
        .status(200)
        .send({ message: "Profile updated successfully", user: updatedData });
    } catch (err) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).send(err);
    }
  },
  updatePassword: async (req, res) => {
    try {
      req.body.password = Crypto.createHmac("SHA256", process.env.CRYPTO_KEY)
        .update(req.body.password)
        .digest("hex");
      req.body.newPass = Crypto.createHmac("SHA256", process.env.CRYPTO_KEY)
        .update(req.body.newPass)
        .digest("hex");

      const { id } = req.user;

      const { password, newPass } = req.body;

      const currentData = await User.findByPk(id);

      if (currentData.password !== password) {
        return res.send({
          conflict: true,
          message: "Please check your current password!",
        });
      }

      currentData.password = newPass;

      await currentData.save();

      res.status(200).send("Password changed successfully!");
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
