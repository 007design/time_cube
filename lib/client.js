'use strict';

const io = require('socket.io-client');

module.exports.startClient = function() {
  const socket = io.connect('http://localhost:8000', {reconnect: true});

  let startTime, activeTask = "task";

  function logTime() {
    let endTime = new Date().getTime();
    socket.emit('time', { name: activeTask, start: startTime, end: endTime });
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
    activeTask = data.name;
  });
};