const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const csv = require('csvtojson');

const file = path.join(__dirname, '../log.csv');
const tempFile = path.join(__dirname, '../temp_log.csv');
const app = express();

fs.stat(file, function(err, stat) {
    if(err == null) {
        //do nothing
    } else if(err.code == 'ENOENT') {
        fs.appendFile(path.join(__dirname, '../log.csv'), 'Agent,Time,Method,Resource,Version,Status\n', function (err) {
            if (err) throw err;
            console.log('Saved!');
          });
    } 
});


var logStream = fs.createWriteStream(file, {flags: 'a'});

app.use(morgan(':user-agent,:date[iso],:method,:url,HTTP/:http-version,:status', {stream: logStream}));

app.use((req, res, next) => {
// write your logging code here

    next()
});

app.get('/', (req, res) => {
// write your code to respond "ok" here
    res.json("ok");

});

app.get('/logs', (req, res) => {
// write your code to return a json object containing the log data here
    fs.readFile(file, 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var result = data.replace(/\, /g, ' ');
    
        fs.writeFile(tempFile, result, 'utf8', function (err) {
        if (err) 
            return console.log(err);

            csv()
            .fromFile(tempFile)
            .then((result) => {
                res.json(result);
            });
        });
    });
 });

module.exports = app;
