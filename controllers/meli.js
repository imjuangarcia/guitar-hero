const path = require('path');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

// Variables definition
const guitars = [];
let nextPage;
let pageUrl;

// To get used guitars from meli
exports.getUsedGuitars = function (req, res, next) {
  console.log(`Running Meli: Used scraper on page ${req.params.pageNumber}`);

  // We're looking for "guitarra electrica", condition = used
  pageUrl = nextPage || `https://instrumentos.mercadolibre.com.ar/instrumentos-cuerdas-guitarras-electricas/usado/guitarra-electrica_NoIndex_True`;

  // Scraping stuff
  request(pageUrl, function (error, response, html) {
    if (!error) {
      const $ = cheerio.load(html);

      // To get the information from the listing
      $('.ui-search-result').filter(function() {
        const id = $(this).find('.ui-search-bookmark').attr('action').split('/')[3];
        const url = $(this).find('.ui-search-link').attr('href');
        const image = $(this).find('.ui-search-result-image__element').attr('data-src');
        const title = $(this).find('.ui-search-result-image__element').attr('alt') || $(this).find('ui-search-item__title').text();
        const price = $(this).find('.price-tag-fraction').text().split('.').join('');

        // Push the guitars to the array
        guitars.push({
          id,
          source: 'meli',
          type: 'used',
          url,
          image,
          price: parseInt(price),
          title,
          order: guitars.length + 1,
        });
      });

      // Get the next page to scrape
      nextPage = $('.ui-search-pagination .andes-pagination__button--next a').attr('href');
    }

    fs.writeFile('data/meli.json', JSON.stringify(guitars, null, 4), function (err) {
      console.log(`File successfully updated: Added ${guitars.length} guitars so far.`);
    });
    
    if(nextPage) {
      res.redirect(`/meli/scrape/${parseInt(req.params.pageNumber) + 1}`);
    } else {
      console.log(`No more pages to scrape after ${req.params.pageNumber} pages. Moving on to the refurbished middleware.`);
      next();
    }
  });
}

// To get refurbished guitars from meli
exports.getRefurbishedGuitars = function (req, res, next) {
  console.log(`Running Meli: Refurbished scraper on page ${req.params.pageNumber}`);

  // We're looking for "guitarra electrica", condition = refurbished
  pageUrl = nextPage || `https://instrumentos.mercadolibre.com.ar/instrumentos-cuerdas-guitarras-electricas/guitarra-electrica_ITEM*CONDITION_2230582_NoIndex_True?#applied_filter_id%3DITEM_CONDITION%26applied_filter_name%3DCondici%C3%B3n%26applied_filter_order%3D6%26applied_value_id%3D2230582%26applied_value_name%3DReacondicionado%26applied_value_order%3D2%26applied_value_results%3D45%26is_custom%3Dfalse`;

  // Scraping stuff
  request(pageUrl, function (error, response, html) {
    if (!error) {
      const $ = cheerio.load(html);

      // To get the information from the listing
      $('.ui-search-result').filter(function() {
        const id = $(this).find('.ui-search-bookmark').attr('action').split('/')[3];
        const url = $(this).find('.ui-search-link').attr('href');
        const image = $(this).find('.ui-search-result-image__element').attr('data-src');
        const title = $(this).find('.ui-search-result-image__element').attr('alt') || $(this).find('ui-search-item__title').text();
        const price = $(this).find('.price-tag-fraction').text().split('.').join('');

        // Push the guitars to the array
        guitars.push({
          id,
          source: 'meli',
          type: 'refurbished',
          url,
          image,
          price: parseInt(price),
          title,
        });
      });

      // Get the next page to scrape
      nextPage = $('.ui-search-pagination .andes-pagination__button--next a').attr('href');
    }

    fs.writeFile('data/meli.json', JSON.stringify(guitars, null, 4), function (err) {
      console.log(`File successfully updated: Added ${guitars.length} guitars so far.`);
    });
    
    if(nextPage) {
      res.redirect(`/meli/scrape/${parseInt(req.params.pageNumber) + 1}`);
    } else {
      console.log(`No more pages to scrape after ${req.params.pageNumber} pages. Downloading file and returning to homepage.`);
      res.redirect('/meli/download');
    }
  });
}

exports.downloadFile = (req, res, next) => {
  const file = path.join(__dirname, '../data/meli.json');
  res.download(file);
}