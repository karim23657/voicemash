function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search.slice(0,-1));
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
  // id: 'XjGdfSttg48'

var config = {
  startTime: parseInt(getParameterByName('start')) || 0,
  endTime: parseInt(getParameterByName('end')) || 0,
  id: getParameterByName('v')
};

config.id && $('.video-url').val('http://youtube.com/watch?v=' + config.id);
config.startTime && $('.start-time').val(config.startTime);
config.endTime && $('.end-time').val(config.endTime);

if(config.startTime && config.endTime)
  config.endTime = config.endTime - config.startTime;

var loop = false;

if(config.id){
  $('.loader').show();
  var tag = document.createElement('script');

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  var player;
  function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
      height: '390',
      width: '640',
      videoId: config.id,
      playerVars: {
        controls: 0,
        rel: 0,
        showinfo: 0,
        enablejsapi: 1,
        modestbranding: 1,
        origin: 'localhost'
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  }

  var done = false;
  var stopTimeout = 0;
  function play(){
    config.startTime && player.seekTo(config.startTime);
    player.playVideo();
    done = false;
  };

  function onPlayerReady(event) {
    player.mute();
    $('.video-container').show();
    $('.loader').hide();
  }

  function onPlayerStateChange(event) {
    if (config.endTime && event.data == YT.PlayerState.PLAYING && !done) {
      loop || animateRecord();
      console.log(2)
      loop && audioWrapper.play() || audioWrapper.record();
      stopTimeout = setTimeout(function (){
        player.pauseVideo();
        loop && play();
      }, config.endTime * 1000);
      done = true;
    } else if(event.data == YT.PlayerState.PAUSED){
      var el;
      if(!loop)
        el = audioWrapper.stop();
      $('.blocker .retry').removeClass('hide');
      $('.slider').text('Save').data('action', 'save').attr('class', 'slider save');
      loop = true;
      if((audioWrapper.el() || {}).readyState > 2)
        play()
      else if(el)
        el.oncanplay = play;
      else if(audioWrapper.el())
        audioWrapper.el().oncanplay = play;
    }
  }
  $('.record').click(function(e){
    $('.record').addClass('animated');
    setTimeout(function(){
      play();
      $('.record').hide();
      $('.slider').show();
    }, 250);
  });
}
function animateRecord(){
  $('.slider').animate({
      backgroundSize: '100%'
    }, (config.endTime || (player.getDuration() - config.startTime)) * 1000,
    'linear'
  );
};

function retry(e){
  window.location.reload();
};

function sendData(){
  var fd = new FormData();
  fd.append('data', soundBlob);
  $.ajax({
      type: 'POST',
      url: '//localhost:8080/blend?start='+config.startTime+'&end='+config.endTime+'&url=http://youtube.com/watch?v=' + config.id,
      data: fd,
      processData: false,
      contentType: false
  }).done(function(response, status, xhr) {
      // check for a filename
      var filename = "";
      var disposition = xhr.getResponseHeader('Content-Disposition');
      if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
      }

      var type = xhr.getResponseHeader('Content-Type');
      var blob = new Blob([response], { type: type });

      if (typeof window.navigator.msSaveBlob !== 'undefined') {
          // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
          window.navigator.msSaveBlob(blob, filename);
      } else {
          var URL = window.URL || window.webkitURL;
          var downloadUrl = URL.createObjectURL(blob);

          if (filename) {
              // use HTML5 a[download] attribute to specify filename
              var a = document.createElement("a");
              // safari doesn't support this yet
              if (typeof a.download === 'undefined') {
                  window.location = downloadUrl;
              } else {
                  a.href = downloadUrl;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
              }
          } else {
              window.location = downloadUrl;
          }

          setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
      }
  });
};

function stopVid(){
  player.stopVideo();
  audioWrapper.stop();
  clearInterval(stopTimeout);
};

$('.slider').click(function(e){
  switch($(this).data('action')){
    case 'stop':
      stopVid();
      $('.slider').stop().text('Retry').data('action', 'retry').attr('class', 'slider retry');
      break;
    case 'save':
      stopVid();
      $('.slider').text('Sending...').data('action', '');
      sendData();
      break;
    case 'retry':
      retry(e);
      break;
  }
});

$('.retry').click(retry);

$('.go').click(function(e){
  var id = /v=[^&]*/.exec($('.video-url').val());
  // start = /t=[^&]*/.exec($('.video-url').val());
  var start = parseInt($('.start-time').val());
  var end = parseInt($('.end-time').val());
  if(!id || !id[0]){
    alert('Invalid URL');
    return;
  }
  window.location = "/?"+id[0]+(start && '&start='+start || '')+(end &&  '&end='+end || '')+'/';
});

var audioWrapper = {
  el: function(){ return $('#audio audio').get(0)},
  play: function(){ this.el() && this.el().play()},
  pause: function(){ this.el() && this.el().pause()},
  reset: function(){ this.el() && this.el().load()},
  record: function(){ startRecording()},
  stop: function(){this.au = stopRecording(); return this.au;}
}
