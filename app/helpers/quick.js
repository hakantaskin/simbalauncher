var fs = require('fs');

export var error_log = function (log) {
  fs.appendFile('error_log.txt', log + "\n", (err) => {
  if (err) throw err;
  console.error(log);
  });
}

export var info_log = function (log) {
  fs.appendFile('info_log.txt', log + "\n", (err) => {
  if (err) throw err;
  console.log(log);
  });
}
