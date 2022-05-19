require('dotenv').config();
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

module.exports = {
  generatePdf: async (data) => {
    try {
      const url = `${process.env.API_URL}/history/invoice/view/${data.id}`;

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

      const pdfPath = path.join(filepath(), `${data.user.name.replace(' ', '')}_invoice_${data.id}.pdf`);

      const browser = await puppeteer.launch();

      const page = await browser.newPage();

      await page.goto(url);

      await page.pdf({
        format: 'letter',
        printBackground: true,
        path: pdfPath,
      });

      console.log(`Invoice #${data.id} PDF created!`);

      await browser.close();

      return pdfPath;
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
