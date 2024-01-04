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

      console.log('Started automation.');

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

      let maxURL = '';
      let maxURLLength = 0;

      if (buttons && buttons.length >= 2) {
          for (let i = 0; i < buttons.length; i++) {
              const currentButton = buttons[i];
              const songURLProperty = await currentButton.getProperty('href');
              const songURL = await songURLProperty.jsonValue();

             

              if (songURL.length > maxURLLength) {
                  maxURLLength = songURL.length;
                  maxURL = songURL;
                  
              }
          }
          console.log('Process completed.');
          return maxURL;
      } else {
          console.log('Buttons array not found or insufficient buttons.');
      }
  } catch (error) {
      console.log(`Error during download (1): ${error}`);
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