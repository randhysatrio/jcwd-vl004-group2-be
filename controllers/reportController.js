const InvoiceItem = require('../models/InvoiceItem');
const Product = require('../models/Product');
const sequelize = require('../configs/sequelize');
const { Op } = require('sequelize');
const { startOfDay, endOfDay } = require('date-fns');
const InvoiceHeader = require('../models/InvoiceHeader');

module.exports = {
  getReport: async (req, res) => {
    try {
      let { search, startDate, endDate, page } = req.body;
      search = search ? search : '';
      page = page ? parseInt(page) : 1;
      let render = 5;
      let start = (page - 1) * render;
      let startNumber = render * page - render;

      // date settings
      let fullDate = new Date();
      let date = `0${fullDate.getDate()}`;
      let month = `0${fullDate.getMonth() + 1}`;
      let year = fullDate.getFullYear();

      // date
      startDate ? null : (startDate = new Date(`${year}-${month}-01`));

      endDate ? null : (endDate = new Date(`${year}-${month}-${date}`));

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
          createdAt: {
            [Op.lt]: endOfDay(new Date(endDate)),
            [Op.gt]: startOfDay(new Date(startDate)),
          },
          '$product.name$': { [Op.like]: `%${search}%` },
          '$invoiceheader.status$': 'approved',
        },
        include: [
          { model: Product, attributes: [] },
          { model: InvoiceHeader, attributes: [] },
        ],
        raw: true,
        group: ['Product.name'],
      });

      // count total data
      let count = countData.length;
      // statistic
      let capital =
        countData.length &&
        countData.reduce((a, b) => ({
          capital: parseInt(a.capital) + parseInt(b.capital),
        }));
      let total_bill =
        countData.length &&
        countData.reduce((a, b) => ({
          total_bill: parseInt(a.total_bill) + parseInt(b.total_bill),
        }));
      let total_sales =
        countData.length &&
        countData.reduce((a, b) => ({
          total_sales: parseInt(a.total_sales) + parseInt(b.total_sales),
        }));
      // top 3 most sold
      let mostSold = () => {
        let dataSort =
          countData && countData.sort((a, b) => b.total_sales - a.total_sales);
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
          createdAt: {
            [Op.lt]: endOfDay(new Date(endDate)),
            [Op.gt]: startOfDay(new Date(startDate)),
          },
          '$product.name$': { [Op.like]: `%${search}%` },
          '$invoiceheader.status$': 'approved',
        },
        include: [
          { model: Product, attributes: [] },
          { model: InvoiceHeader, attributes: [] },
        ],
        raw: true,
        group: ['Product.name'],
        offset: start,
        limit: render,
      });

      res.status(200).send({
        data: response,
        totalPage: Math.ceil(count / render),
        startNumber,
        capital: capital ? capital.capital : 0,
        revenue: total_bill ? total_bill.total_bill : 0,
        profit: total_bill ? total_bill.total_bill - capital.capital : 0,
        sales: total_sales ? total_sales.total_sales : 0,
        mostSold: mostSold(),
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};
