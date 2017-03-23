const express = require('express');
const app = express();
const cors = require('cors');
const scraperAPI = require('./scraperAPI');

app.set('port', (process.env.PORT || 3000));
app.use(cors());


app.get('/', scraperAPI.getData);

app.listen(app.get('port'), function() {
  console.log('Node app is running at localhost:' + app.get('port'));
});

module.exports = app;