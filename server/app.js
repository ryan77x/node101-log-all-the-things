const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

const folderPath = path.join(__dirname, '../logs/');
const fileName = folderPath+'log.csv';
const logFileHeader = 'Agent,Time,Method,Resource,Version,Status\n';

const app = express();

//check if log folder exists else create it
if (!fs.existsSync(folderPath)){
    fs.mkdirSync(folderPath);
}

//check if log file exists
fs.stat(fileName, function(err, stat) {
    if(err == null) {
        //do nothing if file exists else create log file and add header to top of the file content
    } 
    else if(err.code == 'ENOENT') {
        appendContent(logFileHeader);
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

    appendContent(output);

    console.log(output);
    next()
});

app.get('/', (req, res) => {
    res.json("ok");

});

app.get('/logs', (req, res) => {
    csv()
    .fromFile(fileName)
    .then((result) => {
        res.json(result);
    });
 });

 function appendContent(content){
    //file is created automatically if not existed 
    fs.appendFile(fileName, content, function (err) {
        if (err) 
            throw err;
    });
 }
module.exports = app;
