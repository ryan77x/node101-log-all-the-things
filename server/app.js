const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

const file = path.join(__dirname, '../logs/log.csv');
const logFileHeader = 'Agent,Time,Method,Resource,Version,Status\n';

const app = express();

fs.stat(file, function(err, stat) {
    if(err == null) {
        //do nothing if file exists else add log file header to top of the file content
    } 
    else if(err.code == 'ENOENT') {
        appendContent(file, logFileHeader);
    } 
});

app.use((req, res, next) => {
    let userAgent = req.headers["user-agent"].replace(/\, /g, ' ');
    let date = new Date().toISOString();
    let method = req.method;
    let resource = req.originalUrl;
    let protocol = req.protocol.toUpperCase()+'/';
    let version = req.httpVersion;
    let statusCode = res.statusCode;
    let output = userAgent+','+date+','+method+','+resource+','+protocol+version+','+statusCode+'\n';

    appendContent(file, output);

    console.log(output);
    next()
});

app.get('/', (req, res) => {
    res.json("ok");

});

app.get('/logs', (req, res) => {
    csv()
    .fromFile(file)
    .then((result) => {
        res.json(result);
    });
 });

 function appendContent(file, content){
    fs.appendFile(file, content, function (err) {
        if (err) 
            throw err;
    });
 }
module.exports = app;
