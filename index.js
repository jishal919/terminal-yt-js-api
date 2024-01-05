const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

async function downloadYouTubeVideo(url) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--disable-setuid-sandbox","--no-sandbox","--single-process","--no-zygote"],
    });

    try {
        const page = await browser.newPage();

        console.log('Started automation.');

        await page.goto('https://www.ytmp3.nu/');

        // Execute JavaScript to set the input field value to the URL
        await page.evaluate((url) => {
            const input = document.querySelector('input');
            input.focus();
            input.value = url;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }, url);
          

        // Triggering Enter key press to initiate the conversion
        await page.evaluate(() => {
            const convertButton = document.evaluate("//input[@value='Convert']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            convertButton.click();
          });
          

        await page.waitForTimeout(5000);

        console.log('URL processing completed.');

        const buttons = await page.$$('a[rel="nofollow"]');
        const buttonsafterinput = await page.$$('a'); // Selects all buttons on the page
        buttonsafterinput.forEach(async (button, index) => {
            const buttonValue = await button.getProperty('textContent');
            const value = await buttonValue.jsonValue();
            console.log(`Index ${index}: ${value}`);
        });
        try {
            if (true) {
                const secondButton = buttonsafterinput[8];

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
