'use strict';

const io = require('socket.io-client'),
      fs = require('fs'),
      path = require('path');

module.exports.startClient = function() {
  let calibration = require(path.join(__dirname, 'calibration.json'));
  const socket = io.connect('http://localhost:8000', {reconnect: true, query: {'type': 'client'}});

  let startTime, timer;

  function getActiveSide() {
    const x = getX(), y = getY();
    for (let a in calibration.sides)
      // TODO: This needs to be a more robust check against a range of values
      if (calibration.sides[a][0] === x && calibration.sides[a][1] === y)
        return a;
  }

  function logTime() {
    let endTime = new Date().getTime();
    socket.emit('log_time', { side: getActiveSide(), start: startTime, end: endTime });
    console.log('logging time');
    startTime = endTime;
    timer = setTimeout(logTime, calibration.interval);
  }

  function calibrateSide(data) {
    // TODO: Get reading from gyroscope
    calibration.sides[data.side] = [getX(), getY()];
    fs.writeFile(path.join(__dirname, 'calibration.json'), JSON.stringify(calibration), function(err) {
      if (err)
        return console.log(err);

      console.log("calibration saved");
    });
  }

  function doSetInterval(data) {
    calibration.interval = data.interval;
    fs.writeFile(path.join(__dirname, 'calibration.json'), JSON.stringify(calibration), function(err) {
      if (err)
        return console.log(err);

      console.log("calibration saved");
    });
  }

  function getX() {
    return 0;
  }

  function getY() {
    return 0;
  }

  socket.on('connect', function(data) {
    console.log('connected');
    startTime = new Date().getTime();
    logTime();
  });

  socket.on('disconnect', function(data) {
    console.log('disconnected');
    if (timer)
      clearTimeout(timer);
  });

  socket.on('calibrate', function(data) {
    console.log('calibrating', data)
    calibrateSide(data);
  });

  socket.on('interval', function(data) {
    console.log('setting interval', data)
    doSetInterval(data);
  });
};