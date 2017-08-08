'use strict';

const express = require('express'),
      app = express(),
      server = require('http').Server(app),
      io = require('socket.io')(server),
      path = require('path'),
      fs = require('fs');

module.exports.startServer = function() {
  let log = require(path.join(__dirname, 'data', 'data.json'))

  // Serve assets
  app.use(express.static(path.join(__dirname, 'src')));

  let client, browsers = [];

  function registerClient(socket) {
    console.log('client connected');

    socket.on('log_time', function(data) {
      console.log('logging time')
      log.push(data);
      fs.writeFile(path.join(__dirname, 'data', 'data.json'), JSON.stringify(log), function(err) {
        if (err)
          return console.log(err);

        console.log("log saved");
      });
      emitUpdate({'log': data});
    });

    socket.on('disconnect', function(reason) {
      client = false;
      emitUpdate({'status': 'disconnected'});
    });

    client = socket;
    emitUpdate({'status': 'connected'});
  }

  function registerBrowser(socket) {
    console.log('browser connected');

    socket.on('is_client_connected', function(data) {
      socket.emit('is_client_connected', !!client);
    });

    socket.on('calibrate', function(data) {
      console.log('calibrating side')

      if (client)
        client.emit('calibrate', data);
    });

    socket.on('interval', function(data) {
      console.log('setting interval')

      if (client)
        client.emit('interval', data);
    });

    socket.on('disconnect', function(reason) {
      browsers.splice(browsers.indexOf(socket),1)
    });

    browsers.push(socket);
  }

  function emitUpdate(data) {
    for (let a in browsers)
      browsers[a].emit('update', data)
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