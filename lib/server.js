'use strict';

const express = require('express'),
      app = express(),
      server = require('http').Server(app),
      io = require('socket.io')(server),
      bodyParser = require('body-parser'),
      routes = require('./routes.js');

module.exports.startServer = function() {
  app.use(bodyParser.json()); // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

  // Serve assets
  app.use(express.static('./src/assets'));

  for (var a in routes)
    app.get(routes[a].path, function(req, res) {
      routes[a].response(req, res);
    });

  io.on('connection', function(socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('gotit', function(data) {
      console.log(data);
    });
  });

  return server.listen(process.env.port || 8000);
};