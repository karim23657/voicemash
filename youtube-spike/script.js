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

if(config.startTime && config.endTime)
  config.endTime = config.endTime - config.startTime;

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
  var play = function(){
    config.startTime && player.seekTo(config.startTime);
    player.playVideo();
    done = false;
  };

  function onPlayerReady(event) {
    // player.mute();
    $('.video-container').show();
    $('.loader').hide();
  }

  function onPlayerStateChange(event) {
    if (config.endTime && event.data == YT.PlayerState.PLAYING && !done) {
      animateRecord();
      setTimeout(function (){
        player.stopVideo();
      }, config.endTime * 1000);
      done = true;
    }
  }
  $('.record').click(function(e){
    setTimeout(function(){
      play();
      $('.record').addClass('animated');
      $('.record').hide();
      $('.slider').show();
    }, 250);
  });
}

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

function animateRecord(){
  $('.slider').animate({
      backgroundSize: '100%'
    }, (config.endTime || (player.getDuration() - config.startTime)) * 1000,
    'linear'
  );
};
