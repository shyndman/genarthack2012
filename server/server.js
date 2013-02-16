#!/usr/bin/env node
/************************************************************************
 *  Copyright 2010-2011 Worlize Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ***********************************************************************/

var WebSocketServer = require('websocket').server;
var express = require('express');

var app = express.createServer();

app.configure(function() {
    app.use(express.static(__dirname + "/public"));
    app.set('views', __dirname);
    app.set('view engine', 'ejs');
});
app.get('/', function(req, res) {
    res.render('index', { layout: false });
});
app.listen(8080);


var wsServer = new WebSocketServer({
    httpServer: app,

    // Firefox 7 alpha has a bug that drops the
    // connection on large fragmented messages
    fragmentOutgoingMessages: false
});

var onephone = null;
var onephoneConsumers = [];

wsServer.on('request', function(request) {
  if (request.requestedProtocols[0] == 'onephone') {
    if (onephone != null) {
      console.log('disconnecting prev phone', onephone.remoteAddress);
      onephone.disconnect();
    }
    var onephone = request.accept('onephone', request.origin);
    console.log(onephone.remoteAddress + " connected - Protocol Version " + onephone.webSocketVersion);

    // Handle closed connections
    onephone.on('close', function() {
      console.log(onephone.remoteAddress + " disconnected");
    });

    // Handle incoming messages
    onephone.on('message', function(message) {
      try {
        var command = JSON.parse(message.utf8Data);

        if (onephoneserver) {
          // rebroadcast command
          console.log("send", command);
          onephoneserver.sendUTF(message.utf8Data);
        } else {
          console.log("can't send", command);
        }

      }
      catch(e) {
        console.log("noooo", e.message);
        // do nothing if there's an error.
      }
    });
  } else if (request.requestedProtocols[0] == 'onephoneConsumer') {

    var onephoneConsumer = request.accept('onephoneConsumer', request.origin);

    if (onephoneConsumer != null) {
      onephoneConsumers.push(onephoneConsumer);
      // Handle closed onephoneConsumers
      onephoneConsumer.on('close', function() {
        console.log(onephoneConsumer.remoteAddress + " disconnected");

        var index = onephoneConsumers.indexOf(onephoneConsumer);
        if (index !== -1) {
          // remove the onephoneConsumer from the pool
          onephoneConsumers.splice(index, 1);
        }
      });
    }
  }
});

console.log("app ready");
