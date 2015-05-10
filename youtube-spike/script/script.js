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

$('.slider').click(function(e){
  switch($(this).data('action')){
    case 'stop':
      player.stopVideo();
      audioWrapper.stop();
      clearInterval(stopTimeout);
      $('.slider').stop().text('Retry').data('action', 'retry').attr('class', 'slider retry');
      break;
    case 'save':
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
