module.exports = [{
  'path': '/',
  'response': function(req, res, callback) {
    if (callback) callback('hello world')
    res.sendFile(__dirname + '/../src/server.html');
  }
}];