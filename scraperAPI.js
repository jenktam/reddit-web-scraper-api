'use strict';

const cheerio = require('cheerio');
const request = require('request');

const scraperAPI = {
  getData: function(req, res, next){ 
    request('https://www.reddit.com/', function (error, response, html) {
      console.log('error:', error); // Print the error if one occurred 
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
      // console.log(html); // Print the HTML for the Google homepage. 
    
      let $ = cheerio.load(html);
      
      var dirtyTitles = [];

      $('.title').each(function(title){
        dirtyTitles.push($(this).children().first().text());
      });

      var cleanedTitles = dirtyTitles.filter(function(title) {
        return title.length !== 0;
      });

      // Image links
      var links = [];

      $('.thumbnail').each(function(link){
        links.push($(this).attr('href'));
      });

      var fixedLinks = links.map(function(link) {
        if(link.charAt(0) === "/") {
          return "https://www.reddit.com" + link;
        } else {
          return link;
        }
      });

      // Comments fixedLinks to get first top comment and redditor name
      var commentsLinks = [];

      $('.first').each(function(link){
        commentsLinks.push($(this).children().first().attr('href'));
      });

      var allUserComments = [];

      // Navigate inside comments link and print top comment
      const promiseArr = [];
      let promiseVar;
      for(let i = 0; i < commentsLinks.length; i++) {
        promiseVar = new Promise(function(resolve, reject) {
          request(commentsLinks[i], function(error, response, html) {
            console.log('error:', error); // Print the error if one occurred 
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
            
            let $ = cheerio.load(html);

            if(error) {
              reject(error);
            }

            // Finds first comment within article link
            resolve($('.usertext-body').eq(1).first().first().text());
          });
        }).then(function(topUserComment) {
          allUserComments.push(topUserComment);  
        });
        promiseArr.push(promiseVar);
      }

      // Send final data after all promises finished.
      Promise.all(promiseArr).then(function(){
        // Build API Array
        var apiArray = [];
        cleanedTitles.forEach(function(elem, index) {
          apiArray.push({
            "title": cleanedTitles[index],
            "link": fixedLinks[index],
            "top comment": allUserComments[index]
          });
        });

        const data = JSON.stringify(apiArray);
        res.set('Content-Type', 'application/JSON');
        res.send(data);
      });



    });
  }
};

// refers to const scraperAPI in line 4
module.exports = scraperAPI;