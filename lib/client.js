'use strict';

const io = require('socket.io-client');

module.exports.startClient = function() {
  const socket = io.connect('http://localhost:8000', {reconnect: true, query: {'type': 'client'}});

  let startTime, activeTask = "task";

  function logTime() {
    let endTime = new Date().getTime();
    socket.emit('log_time', { name: activeTask, start: startTime, end: endTime });
    console.log('logging time');
    startTime = endTime;
    setTimeout(logTime, 2000);
  }

  socket.on('connect', function(data) {
    console.log('connected');
    startTime = new Date().getTime();
    logTime();
  });

  socket.on('switch task', function(data) {
    console.log('switching task', data)
    activeTask = data.name;
  });
};