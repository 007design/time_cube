'use strict';

const io = require('socket.io-client');

module.exports.startClient = function() {
  const socket = io.connect('http://localhost:8000', {reconnect: true});

  socket.on('connect', function(socket) {
    console.log('connected');
  });

  socket.on('news', function() {
    console.log('client news')
    socket.emit('gotit', { news: 'received' });
  });
};