const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { Cluster } = require('puppeteer-cluster');

const app = express();
const port = 3000;

app.use(cors({ origin: '*' }));

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.json('This is my webscraper');
});

app.get('/scrape', async (req, res) => {
  try {
    const { url } = req.query;
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 4, // adjust as needed
      puppeteerOptions: {
        headless: true,
        executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
      },
      timeout: 120000000, 
    });
    await cluster.task(async ({ page, data: url }) => {
      await page.goto(url);
      const jobOffers = [];
      let pageCounter = 1;
      while (true) {
        const jobOfferElements = await page.$$eval('.result-item', (elements) => {
          return elements.map((element) => {
            const jobtitle = element.querySelector('.item-title a')?.textContent?.trim();
            const jobsalary = element.querySelector('.info-salary')?.textContent?.trim();
            const companyName = element.querySelector('.info-company-name')?.textContent?.trim();
            const location = element.querySelector('.info-city')?.textContent?.trim();
            const publishdate = element.querySelector('.info-publish-date')?.textContent?.trim();

            return {
              jobtitle,
              jobsalary,
              companyName,
              location,
              publishdate,
            };
          });
        });
        jobOffers.push(...jobOfferElements);

        const nextPageButton = await page.$('a.js-btn-next');
        if (!nextPageButton) break;
        await nextPageButton.click();
        await page.waitForSelector('.result-item');

        pageCounter++;
        if (pageCounter > 100) break;

        await page.waitForTimeout(100000);
      }

      // Write the job offers to a JSON file
      fs.writeFileSync('job-lists.json', JSON.stringify(jobOffers, null, 2));
    });
    await cluster.execute(url);
    await cluster.idle();
    await cluster.close();

    // Send a response with an OK status code and the job offers in the response body
    res.status(200).json('Job listings scraped successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error scraping job listings');
  }
});

const server = app.listen(port, () => {
  console.log(`Job scraper app listening at http://localhost:${port}`);
});

// Callback function that is executed when the server has started listening
server.on('listening', () => {
  console.log(`Server listening on port ${port}`);
});