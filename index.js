const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

async function downloadYouTubeVideo(url) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
    });

    try {
        const page = await browser.newPage();

        console.log('Getting the music URL');

        await page.goto('https://www.ytmp3.nu/');

        const inputSelector = 'input';
        await page.waitForSelector(inputSelector);
        const inputField = await page.$(inputSelector);

        await inputField.type(url);

        const convertButtonSelector = "//input[@value='Convert']";
        await page.waitForXPath(convertButtonSelector);
        const convertButton = await page.$x(convertButtonSelector);
        await convertButton[0].click();

        await page.waitForTimeout(5000);

        console.log('URL processing completed.');

        const buttons = await page.$$('a[rel="nofollow"]');
        try {
            if (buttons.length >= 2) {
                const secondButton = buttons[1];
                const songURLProperty = await secondButton.getProperty('href');
                const songURL = await songURLProperty.jsonValue();
                return songURL;
            }
        } catch (error) {
            console.log(`Error during download: ${error}`);
        }
    } finally {
        await browser.close();
    }
}

app.post('/send_req', async (req, res) => {
  const url = req.body.url;
  if (!url) {
    return res.status(400).json({ error: 'Did not provide the url parameter, include the \'url\' parameter' });
  } else {
    const result = await downloadYouTubeVideo(url);

    const details = {
      Status: 'Online',
      'song-url': url,
      'Download-url': result,
      Author: 'Terminal',
      'Launch-date': '4-11-23'
    };
    return res.json(details);
  }
});

const listener = app.listen(3000, '0.0.0.0', () => {
  console.log('API is listening on port 3000');
});
