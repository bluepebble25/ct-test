var app = require('express')();
var server = require('http').createServer(app);

const path = require('path');

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/../index.html'));
});

module.exports = server;
