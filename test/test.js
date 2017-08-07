'use strict';

const assert = require('assert'),
      Nightmare = require('nightmare'),
      server = require('../lib/server.js'),
      client = require('../lib/client.js');

let s, c;
describe('Start Server', function() {
  this.timeout(10000);
  before(function() {
    s = server.startServer();
    c = client.startClient();
  });
  after(function() {
    s.close();
  });

  it('should start the server', function(done) {
    const nightmare = Nightmare({
      show: true
    });
    nightmare.goto('http://localhost:8000')
    .wait(6000)
    .end()
    .then(function() {
      done();
    });
  });
});