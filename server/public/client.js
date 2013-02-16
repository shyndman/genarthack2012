window.wsurl = "ws://ec2-54-234-201-143.compute-1.amazonaws.com";
window.wsCtor = window['MozWebSocket'] ? MozWebSocket : WebSocket;

function events(on_message, on_close) {
  this.socket = new wsCtor(wsurl, 'onephoneconsumer');
  this.socket.onmessage = function(message) {
    var data = JSON.parse(message.data);
    on_message(data);
  };
  if (on_close != null)
    this.socket.onclose = on_close;
};

function deltas(f) {
  var prev = {tiltLR: 0, tiltFB: 0, dir: 0, touches: []};
  events(function (data) {
    data.dLR = (prev.tiltLR - data.tiltLR) || 0;
    data.dFB = (prev.tiltFB - data.tiltFB) || 0;
    data.dDir = (prev.dir - data.dir) || 0;
    for (var i = 0; i < 5; i++) {
      t = data.touches[i];
      p = prev.touches[i];
      if (t != null) {
        if (p == null) {
          t.dx = 0;
          t.dy = 0;
        } else {
          t.dx = (p.x - t.x) || 0;
          t.dy = (p.y - t.y) || 0;
        }
      }
    }
    prev = data;
    f(data);
  }, null);
}
