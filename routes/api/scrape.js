var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var router = express();

router.get('/', function (req, res) {
	var url = req.query.url,
			recipe = {
				title: null,
				cuisine: null,
				ingredients: [],
				method:[],
				time: {
					preparation: null,
					cooking: null
				},
				serves: null,
				rating: {
					average: null,
					count: null,
					total: null
				},
				self_url: url
			};
	request(url, function (err, response, html) {
		if (!err) {
			var $ = cheerio.load(html);
			recipe.title = $('h1.content-title__text').text();
			if (!recipe.title || recipe.title.length < 1) {
				// res.sendStatus(404, 'Page not found');
				return res.send({ error: "Not a valid BBC Good Food URL" });
			} else {
				$('.recipe-ingredients-wrapper > *').each(function (index, item){
					// Trim string up to line break where ingredient anchor description starts
					var lineBreak = $(this).text().indexOf('\n');
					if (lineBreak > 0) {
						recipe.ingredients.push($(this).text().substring(0, lineBreak));
					} else {
						recipe.ingredients.push($(this).text());
					}

				});
				$('.recipe-method__list li').each(function (index, item) {
					recipe.method.push($(this).text());
				});
				recipe.time = {
					preparation: $('.recipe-metadata__prep-time').text(),
					cooking: $('.recipe-metadata__cook-time').text()
				}
				recipe.serves = $('.recipe-metadata__serving').text();
				recipe.image = $('.recipe-media__image').attr('src');

				res.send(recipe);
			}

		} else {
			console.log(err);
			res.send({ error: 'Invalid URI'});
		}
	})
});

module.exports = router;
