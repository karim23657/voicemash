var express = require('express'),
    fs = require('fs'),
    ytdl = require('ytdl-core'),
    wav = require('wav'),
    ffmpeg = require('fluent-ffmpeg'),
    url = require('url');

var PORT = 8080;
var app = express();
app.use(function(req, res, next) {
    var data = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        data += chunk;
    });

    req.on('end', function() {
        req.body = data;
        next();
    });
});

// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.all('*', function(req, res, next) {
       res.header("Access-Control-Allow-Origin", "*");
       res.header("Access-Control-Allow-Headers", "X-Requested-With");
       res.header('Access-Control-Allow-Headers', 'Content-Type');
       next();
});

app.get('/stream', function(request, res) {
  var url_parts = url.parse(request.url, true);
  var youtubeUrl = url_parts.query.url;

}).post('/blend', function(request, res) {
  var url_parts = url.parse(request.url, true);
  var youtubeUrl = url_parts.query.url;

  var videoName = createGuid() + ".video";
  var videoFile = fs.createWriteStream(videoName);
  ytdl(youtubeUrl, { 
    filter: "videoonly"
  }).pipe(videoFile);

  ffmpeg(fs.createReadStream(videoName))
      .videoCodec('copy')
      .addInput(request.pipe)
      .audioCodec('copy')
      .output(res.pipe, {end: true});
});

app.listen(PORT);
console.log('Listening on port ' + PORT);

function createGuid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
}

