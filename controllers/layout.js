const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

exports.homepage = (req, res) => {
  res.json('Homepage');
}