const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const csv = require('csvtojson');

const file = path.join(__dirname, '../log.csv');
const tempFile = path.join(__dirname, '../temp_log.csv');
const logFileHeader = 'Agent,Time,Method,Resource,Version,Status\n';
const formatStr = ':user-agent,:date[iso],:method,:url,HTTP/:http-version,:status';

const app = express();

fs.stat(file, function(err, stat) {
    if(err == null) {
        //do nothing if file exists else add log file header to top of the file content
    } else if(err.code == 'ENOENT') {
        fs.appendFile(file, logFileHeader, function (err) {
            if (err) 
                throw err;
          });
    } 
});

var logStream = fs.createWriteStream(file, {flags: 'a'});

app.use(morgan(formatStr));
app.use(morgan(formatStr, {stream: logStream}));

app.get('/', (req, res) => {
    res.json("ok");

});

app.get('/logs', (req, res) => {
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
