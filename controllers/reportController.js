const InvoiceItem = require('../models/InvoiceItem');
const Product = require('../models/Product');
const sequelize = require('../configs/sequelize');
const { Op } = require('sequelize');

module.exports = {
  getReport: async (req, res) => {
    try {
      let { search, startDate, endDate } = req.query;
      let page = req.query.page ? req.query.page : 1;
      page = parseInt(page);
      let render = 5;
      let start = (page - 1) * render;
      let startNumber = render * page - render;

      // date settings
      let fullDate = new Date();
      let date = `0${fullDate.getDate()}`;
      let month = `0${fullDate.getMonth() + 1}`;
      let year = fullDate.getFullYear();

      // date
      startDate = startDate
        ? new Date(startDate)
        : new Date(`${year}-${month}-01`);
      startDate.setUTCHours(0, 0, 0, 0);

      endDate = endDate
        ? new Date(endDate)
        : new Date(`${year}-${month}-${date}`);
      endDate.setUTCHours(23, 59, 59, 999);

      // get data for count
      const countData = await InvoiceItem.findAll({
        attributes: [
          'product.name',
          [sequelize.fn('COUNT', sequelize.col('product.id')), 'total_sales'],
          [
            sequelize.fn(
              'SUM',
              sequelize.where(
                sequelize.col('quantity'),
                '*',
                sequelize.col('price')
              )
            ),
            'total_bill',
          ],
          [
            sequelize.fn(
              'SUM',
              sequelize.where(
                sequelize.col('quantity'),
                '*',
                sequelize.col('product.price_buy')
              )
            ),
            'capital',
          ],
        ],
        where: {
          [Op.and]: {
            createdAt: {
              [Op.lt]: endDate,
              [Op.gt]: startDate,
            },
            '$product.name$': { [Op.like]: `%${search}%` },
          },
        },
        include: [{ model: Product, attributes: [] }],
        raw: true,
        group: ['Product.name'],
      });

      // count total data
      let count = countData.length;
      // statistic
      let capital = countData.reduce((a, b) => ({
        capital: parseInt(a.capital) + parseInt(b.capital),
      }));
      let total_bill = countData.reduce((a, b) => ({
        total_bill: parseInt(a.total_bill) + parseInt(b.total_bill),
      }));
      let total_sales = countData.reduce((a, b) => ({
        total_sales: parseInt(a.total_sales) + parseInt(b.total_sales),
      }));
      // top 3 most sold
      let mostSold = () => {
        let dataSort = countData.sort((a, b) => b.total_sales - a.total_sales);
        return dataSort.slice(0, 3);
      };

      // get report
      const response = await InvoiceItem.findAll({
        attributes: [
          'id',
          'price',
          'product.name',
          'product.unit',
          [sequelize.fn('COUNT', sequelize.col('product.id')), 'total_sales'],
          [sequelize.fn('SUM', sequelize.col('quantity')), 'sold_volume'],
          [
            sequelize.fn(
              'SUM',
              sequelize.where(
                sequelize.col('quantity'),
                '*',
                sequelize.col('price')
              )
            ),
            'total_bill',
          ],
          [
            sequelize.fn(
              'SUM',
              sequelize.where(
                sequelize.col('quantity'),
                '*',
                sequelize.col('product.price_buy')
              )
            ),
            'capital',
          ],
        ],
        where: {
          [Op.and]: {
            createdAt: {
              [Op.lt]: endDate,
              [Op.gt]: startDate,
            },
            '$product.name$': { [Op.like]: `%${search}%` },
          },
        },
        include: [{ model: Product, attributes: [] }],
        raw: true,
        group: ['Product.name'],
        offset: start,
        limit: render,
      });

      res.status(200).send({
        data: response,
        totalPage: Math.ceil(count / render),
        startNumber,
        capital: capital.capital,
        revenue: total_bill.total_bill,
        profit: total_bill.total_bill - capital.capital,
        sales: total_sales.total_sales,
        mostSold: mostSold(),
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};
