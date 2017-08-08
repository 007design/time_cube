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

  let client, connections = [];

  function registerClient(socket) {
    console.log('client connected');
    socket.on('log_time', function(data) {
      console.log('logging time')
      emitUpdate(data);
    });

    client = socket;
  }

  function registerBrowser(socket) {
    console.log('browser connected');
    socket.on('switch task', function(data) {
      console.log('browser switching task')
      client.emit('switch task', data);
    });

    socket.on('disconnect', function(reason) {
      connections.splice(connections.indexOf(socket),1)
    });

    connections.push(socket);
  }

  function emitUpdate(data) {
    for (let a in connections)
      connections[a].emit('update', data)
  }

  io.on('connection', function(socket) {
    if (socket.handshake.query.type === 'client') {
      registerClient(socket);
    } else if (socket.handshake.query.type === 'browser') {
      registerBrowser(socket)
    }
  });

  return server.listen(process.env.port || 8000);
};