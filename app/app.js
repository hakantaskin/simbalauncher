// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import { greet } from './hello_world/hello_world'; // code authored by you in this project
import env from './env';
const http = require('http');
const fs = require('fs');
var assert = require('assert');
var promise = require('bluebird');
var url = require('url');
var extract = require('extract-zip');
const child_process = require('child_process');
const exec = child_process.exec;
const execFile = child_process.execFile;
const spawn = child_process.spawn;

console.log('Loaded environment variables:', env);

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());
var local_version = "";
var remote_version = "";
var txtfile = 'last_version.txt';
var zipfile = 'simba_latest.zip';

var set_version = function (version){
  fs.writeFile('./' + txtfile, version, (err) => {
    if (err) throw err;
  });
}

var download_file = function (remote_version){
  console.log("download start");
  download(env.simba_download_url).then(function(stream) {
    try {
        var writeStream = fs.createWriteStream(zipfile);
        stream.pipe(writeStream);
        sync_new_version();
        set_version(remote_version);
    } catch(e) {
        console.error(e);
    }
  });
}

var sync_new_version = function (){
  try {
    console.log(app.getAppPath('desktop'));
    extract(zipfile, {dir: ''}, function (err) {
    // extraction is complete. make sure to handle the err
      if (err) throw err;
      console.log("unzip");
    });
  } catch(e){
      console.error(e);
  }
}

function download(option) {
    assert(option);
    if (typeof option == 'string') {
        option = url.parse(option);
    }

    return new promise(function(resolve, reject) {
        var req = http.request(option, function(res) {
            if (res.statusCode == 200) {
                resolve(res);
            } else {
                if (res.statusCode === 301 && res.headers.location) {
                    resolve(download(res.headers.location));
                } else {
                    reject(res.statusCode);
                }
            }
        })
        .on('error', function(e) {
            reject(e);
        })
        .end();
    });
}

setInterval(function(){
  if(os.platform() != 'darwin'){
    exec('tasklist /fo:csv /fi "imagename eq Simba.exe"', (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
      var processid = "";
      var result = stdout.match(/"Simba.exe","(.*?)","Console"/g).map(function(val){
        if(val.length > 0){
          processid =  val;
          console.log("processid : " + processid);
        } else {
          console.log("program calismiyor");
          exec('simba/Simba.exe', function(err, data) {
            console.log(err)
            console.log(data.toString());
         });
        }
      });
    });
  }

  fs.readFile('./' + txtfile, function read(err, data) {
    if (err) {
        throw err;
    }
    local_version = data;
    http.get(env.version_url, (res) => {
    res.on("data", function(chunk) {
      remote_version = chunk;
      if (local_version.toString() != remote_version.toString()){
          download_file(remote_version);
      }
    });
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
    });
  });
}, 5000);
