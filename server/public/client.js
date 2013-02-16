function onePhoneEvents(on_message, on_close, url) {
    //var url = "ws://ec2-184-73-104-159.compute-1.amazonaws.com"

    var wsCtor = window['MozWebSocket'] ? MozWebSocket : WebSocket;
    this.socket = new wsCtor(url, 'onephoneConsumer');

    this.socket.onmessage = function(message) {
      var data = JSON.parse(message.data);
      on_message(data);
    };
    if (on_close != null)
      this.socket.onclose = on_close;
};
