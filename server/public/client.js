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
  var prevs = {}
  events(function (data) {
    if (prevs[data.id] == null)
      prevs[data.id] = {tiltLR: 0, tiltFB: 0, dir: 0, touches: []};
    prev = prevs[data.id];
    data.dLR = (data.tiltLR - prev.tiltLR) || 0;
    data.dFB = (prev.tiltFB - data.tiltFB) || 0;
    data.dDir = (prev.dir - data.dir) || 0;
    for (var i = 0; i < 5; i++) {
      c = data.touches[i];
      p = prev.touches[i];
      if (c != null) {
        if (p == null) {
          c.dx = 0;
          c.dy = 0;
        } else {
          c.dx = (c.x - p.x) || 0;
          c.dy = (c.y - p.y) || 0;
        }
      }
    }
    prevs[data.id] = data;
    f(data);
  }, null);
}
