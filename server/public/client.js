window.wsurl = "ws://ec2-184-73-104-159.compute-1.amazonaws.com";
window.wsurl = "ws://localhost:8080";
window.wsCtor = window['MozWebSocket'] ? MozWebSocket : WebSocket;

function simulate() {
  return new wsCtor(wsurl, 'onephone');
}

// Message JSON object:
// tiltLR, tiltFB, dir, touches
function onePhoneEvents(on_message, on_close) {
  this.socket = new wsCtor(wsurl, 'onephoneConsumer');
  this.socket.onmessage = function(message) {
    var data = JSON.parse(message.data);
    on_message(data);
  };
  if (on_close != null)
    this.socket.onclose = on_close;
};
