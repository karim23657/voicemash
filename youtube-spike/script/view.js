function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search.slice(0,-1));
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
  // id: 'XjGdfSttg48'

var xmlhttp;
if (window.XMLHttpRequest)
  {// code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp=new XMLHttpRequest();
  }
else
  {// code for IE6, IE5
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
xmlhttp.onreadystatechange=function()
  {
  if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
      d = JSON.parse(xmlhttp.responseText);
      window.location = '/?'+(/v=[^&]*/.exec(d[3]))+'&start='+d[4]+'&end='+(+d[4] + +d[5])+'&aud='+d[2]
    }
  }
xmlhttp.open("GET",'http://voicemash.bharathraja.in:5000/save?k='+getParameterByName('k'),true);
xmlhttp.send();

