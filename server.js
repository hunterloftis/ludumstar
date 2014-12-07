var path = require('path');
var express = require('express');

express()
  .use('/build', express.static(path.join(__dirname, 'build')))
  .get('/', sendIndex)
  .listen(process.env.PORT || 5000);

function sendIndex(req, res, next) {
  res.sendFile(path.join(__dirname, 'index.html'));
}
