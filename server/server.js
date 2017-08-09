'use strict';

const express = require('express'),
      app = express(),
      server = require('http').Server(app),
      io = require('socket.io')(server),
      low = require('lowdb'),
      fileAsync = require('lowdb/lib/storages/file-async'),
      path = require('path'),
      fs = require('fs');

module.exports.startServer = function() {
  const db = low(path.join(__dirname, 'data', 'data.json'), {
    storage: fileAsync
  })

  // Serve assets
  app.use(express.static(path.join(__dirname, 'src')));

  let client, browsers = [];

  function emitUpdate(data) {
    for (let a in browsers)
      browsers[a].emit('update', data)
  }

  function registerClient(socket) {
    console.log('client connected');

    socket.on('log_time', function(data) {
      console.log('logging time');

      const task = db.get('sides')
        .find({side: data.side})
        .value();
      const last = db.get('log')
        .find(function(i) {
          return i.blocks[i.blocks.length-1].end === data.start && i.name === task.name;
        }).value();

      if (last) {
        // TODO: This is wrong
        db.get('log')
          .find(function(i) {
            return i.blocks[i.blocks.length-1].end === data.start && i.name === task.name;
          }).assign({
            end: data.end,
            duration: last.duration + (data.end - data.start)
          }).write();
      } else {
        db.get('log')
          .push({
            name: task.name,
            side: data.side,
            blocks: [{
              duration: data.end - data.start,
              end: data.end
            }]
          }).write();
      }

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

    socket.on('total', function(data) {
      console.log('getting total')

      let sum = 0;
      db.get('log')
        .each(function(i) {
          sum += i.duration;
        }).value();
      socket.emit('total', {total: sum});
    });

    socket.on('task', function(data) {
      console.log('setting task');

      db.get('sides')
        .find({side: data.side})
        .assign({name: data.name})
        .write();
    });

    socket.on('disconnect', function(reason) {
      browsers.splice(browsers.indexOf(socket),1)
    });

    browsers.push(socket);
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