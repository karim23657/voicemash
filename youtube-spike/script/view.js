function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search.slice(0,-1));
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
  // id: 'XjGdfSttg48'
$.ajax({
  url: 'http://localhost:5000/save?k='+getParameterByName('k'),
  success: function(data){
    d = JSON.parse(data);
    window.location = '/?'+(/v=[^&]*/.exec(d[3]))+'&start='+d[4]+'&end='+(+d[4] + +d[5])+'&aud='+d[2]
  }
})
