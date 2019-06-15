const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

const folderPath = path.join(__dirname, '../logs/');
const logName = 'log';
const fileType = '.csv'
const partialFileName = folderPath + logName;
const fileName = folderPath + logName + fileType;
const logFileHeader = 'Agent,Time,Method,Resource,Version,Status\n';
const rotateLogFileLimit = 20;
let checkCurrentLogFileLine = true;
let currentLogFileLineNumber = 0;
let logFileIsRenamed = false;


const app = express();

//check if log folder exists else create it
if (!fs.existsSync(folderPath)){
    fs.mkdirSync(folderPath);
}

//for logging
app.use((req, res, next) => {
    let userAgent = req.headers["user-agent"].replace(/\, /g, ' ');
    let date = new Date().toISOString();
    let method = req.method;
    let resource = req.originalUrl;
    let protocol = req.protocol.toUpperCase()+'/';
    let version = req.httpVersion;
    let statusCode = res.statusCode;
    let output = userAgent+','+date+','+method+','+resource+','+protocol+version+','+statusCode+'\n';

    console.log(output);
    appendContent(output);

    next()
});

app.get('/', (req, res) => {
    res.status(200).json("ok");

});

app.get('/logs', (req, res) => {
    //check if log file exists
    fs.stat(fileName, function(err, stat) {
        if(err == null) {
            csv()
            .fromFile(fileName)
            .then((result) => {
                res.status(200).json(result);
            });
        } 
        else if(err.code == 'ENOENT') {
            res.status(404).json("Log file not found");
        } 
    });

});

function appendContent(content){
    //check if log file exists
    fs.stat(fileName, function(err, stat) {
        //while log file is being renamed, fs.stat still sees it as existed
        if(err == null && logFileIsRenamed != true) {
            if (checkCurrentLogFileLine){
                checkCurrentLogFileLine = false;
                let text = fs.readFileSync(fileName).toString();
                let lines = text.split('\n');
                currentLogFileLineNumber = lines.length - 1
            }

            appendToFile(content);
        } 
        else if(err.code == 'ENOENT') {
            //if file doesn't exist, create log file and add header to top of the file content
            logFileIsRenamed = false;
            currentLogFileLineNumber = 0;
            appendToFile(logFileHeader, ()=>{
                checkCurrentLogFileLine = false;
                appendToFile(content);
            });
        } 
    });
}

function appendToFile(content, callback=null){
    //file is created automatically if not existed 
    fs.appendFile(fileName, content, function (err) {
        if (err){ 
            throw err;
        }
        currentLogFileLineNumber++;
        rotateLogFile(()=>{
            if (callback !== null){
                callback();
            }
        });
    });
}

function rotateLogFile(callback = null){
    if (currentLogFileLineNumber > rotateLogFileLimit){
        let newFileName = partialFileName + ' ' + new Date().toISOString() + fileType;
        logFileIsRenamed = true;
        fs.rename(fileName, newFileName, function (err) {
            if (err){
                throw err;
            }
            currentLogFileLineNumber = 0;  
            if (callback !== null){
                callback();
            }
        });
    }
    else{
        if (callback !== null){
            callback();
        }
    }
}

module.exports = app;
