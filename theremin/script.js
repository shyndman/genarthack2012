window.wsurl = "ws://ec2-54-234-201-143.compute-1.amazonaws.com/";
window.wsCtor = window['MozWebSocket'] ? MozWebSocket : WebSocket;

function onePhoneEvents(on_message, on_close) {
  this.socket = new wsCtor(wsurl, 'onephoneConsumer');
  this.socket.onmessage = function(message) {
    var data = JSON.parse(message.data);
    on_message(data);
  };
  if (on_close != null)
    this.socket.onclose = on_close;
}
onePhoneEvents(soundWildness);

var context = new webkitAudioContext(),
    gainNode = context.createGainNode(),
    tone = context.createOscillator(),
    sineDetune = context.createOscillator(),
    vibrato = context.createJavaScriptNode(4096, 1, 1);

tone.type = 1; // sine wave
tone.frequency.value = 261.626;
tone.connect(gainNode);

tone.connect(vibrato)

var cc = 0;
vibrato.onaudioprocess = function(ev) {
  var inp = ev.inputBuffer.getChannelData(0);
  var out = ev.outputBuffer.getChannelData(0);
  for (var i = 0; i < inp.length; i++) {
    out[i] = inp[i] * (1 + Math.sin(cc * 1 * 0.001) * 0.5);
    cc++;
  }
}

gainNode.gain.value = 0.2;

vibrato.connect(gainNode)
gainNode.connect(context.destination);

function soundWildness(phoneInfo) {
  if (!phoneInfo.touches[0]) return;

  var frequency = 1 - (phoneInfo.touches[0].y / 1420);
  frequency = frequency * (1046.50 - 130.813) + 130.813
  tone.frequency.value = frequency;
  tone.noteOn(0);
}