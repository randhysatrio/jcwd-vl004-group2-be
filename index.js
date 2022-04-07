const express = require('express');
const cors = require('cors');
const sequelize = require('./configs/sequelize');

const app = express();

app.use(cors());
app.use(express.json());

(async () => {
  try {
    await sequelize.authenticate();
    console.log('sequelize connection success!');
  } catch (error) {
    console.log(error);
  }
})();

app.listen(5000, () => console.log('API running at port 5000'));
