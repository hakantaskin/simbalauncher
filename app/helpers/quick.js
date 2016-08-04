var fs = require('fs');

export var error_log = function (log) {
  var date = new Date().toISOString();
  fs.appendFile('error_log.txt', "[ "+ date +" ] " + log + "\r\n", (err) => {
  if (err) throw err;
  console.error(log);
  });
}

export var info_log = function (log) {
  var date = new Date().toISOString();
  fs.appendFile('info_log.txt', "[ "+ date +" ] " + log + "\r\n", (err) => {
  if (err) throw err;
  console.log(log);
  });
}
