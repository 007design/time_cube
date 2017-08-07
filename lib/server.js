'use strict';

const express = require('express'),
      app = express(),
      server = require('http').Server(app),
      io = require('socket.io')(server),
      bodyParser = require('body-parser');
      // routes = require('./routes.js');

module.exports.startServer = function() {
  app.use(bodyParser.json()); // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

  // Serve assets
  app.use(express.static('./src'));

  // for (var a in routes)
  //   app.get(routes[a].path, function(req, res) {
  //     routes[a].response(req, res);
  //   });

  let connections = [];

  function emitUpdate(socket, data) {
    for (let a in connections)
      if (connections[a] !== socket)
        connections[a].emit('update', data)
  }

  io.on('connection', function(socket) {
    console.log('connected');
    connections.push(socket);
    socket.on('time', function(data) {
      emitUpdate(socket, data);
    });
  });

  return server.listen(process.env.port || 8000);
};