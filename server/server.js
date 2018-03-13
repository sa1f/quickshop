var app = require('./app');
var port = process.env.PORT || 3000;
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  console.log('http://localhost:' + listener.address().port);
});