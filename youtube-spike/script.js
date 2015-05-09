var config = {
  startTime: 7,
  endTime: 12
};

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('yt-player', {
    height: '390',
    width: '640',
    videoId: 'tQuvWWJK44w',
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

var play = function(){
  player.seekTo(config.startTime);
  player.playVideo();
};

function onPlayerReady(event) {
  // player.mute();
}

var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(function (){
    	player.stopVideo();
    }, config.endTime * 1000);
    done = true;
  }
}
