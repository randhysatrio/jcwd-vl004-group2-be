require('dotenv').config();
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

module.exports = {
  generatePdf: async (req, res) => {
    try {
      const url = `${process.env.API_URL}/history/invoice/view/${req.params.id}`;

      const filepath = () => {
        const path = './public/pdf';

        if (fs.existsSync(path)) {
          return path;
        } else {
          fs.mkdir(path, { recursive: true }, (err) => {
            if (err) {
              console.log(err);
            } else {
              return path;
            }
          });
        }
      };

      const pdfPath = path.join(`${filepath()}`, `pdf_invoice_${req.params.id}_${Date.now()}.pdf`);

      const browser = await puppeteer.launch();

      const page = await browser.newPage();

      await page.goto(url);

      await page.pdf({
        format: 'letter',
        printBackground: true,
        path: pdfPath,
      });

      console.log('Invoice PDF created!');

      await browser.close();

      res.download(pdfPath);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};
