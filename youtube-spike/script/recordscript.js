var audio_context;
var recorder;

function startUserMedia(stream) {
  var input = audio_context.createMediaStreamSource(stream);
  recorder = new Recorder(input);
}

function startRecording() {
  recorder && recorder.clear();
  recorder && recorder.record();
}

function stopRecording() {
  recorder && recorder.stop();
  var au = createDownloadLink();
  recorder.clear();
  return au;
}

function createDownloadLink() {
  var au = document.createElement('audio');
  recorder && recorder.exportWAV(function(blob) {
    var url = URL.createObjectURL(blob);
    au.controls = true;
    au.loop = 'loop';
    au.src = url;
    $('#audio').html($(au));
  });
  return au;
}

window.onload = function init() {
  try {
    // webkit shim
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.URL || window.webkitURL;

    audio_context = new AudioContext;
  } catch (e) {
    alert('No web audio support in this browser!');
  }

  navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
  });
};
