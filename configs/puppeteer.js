const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async function () {
  try {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await puppeteer.pdf({
      path: 'invoice.pdf',
      format: 'A4',
      printBackground: true,
    });

    console.log('Invoice PDF created!');

    await browser.close();

    process.exit();
  } catch (err) {
    console.log(err);
  }
});
