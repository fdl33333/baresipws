"use strict";

process.title = 'baresipws';

var debug=false;

const bsPort = 4444;
const wsPort = 1234;
const host = 'localhost';

const Net = require('net');
const Netstring = require('netstring-stream');
const var_dump = require('var_dump');
const webSocketServer = require('websocket').server;
const http = require('http');

var bsConnStat = 0;


/////////////////////////////////////////////////////////////
///////////////////// WebSocket server for HTTP Page
/////////////////////////////////////////////////////////////

// var history = [ ];	// latest 100 messages
var clients = [ ];	// list of currently connected clients (users)

var server = http.createServer(function(request, response) {
	// Not important for us. We're writing WebSocket server,
	// not HTTP server
});

var wsServer = new webSocketServer({
	httpServer: server
});

server.listen(wsPort, function() {
	if (debug) console.log((new Date()) + " Server is listening on port "  + wsPort);
});

wsServer.on('request', function(request) {
	if (debug) console.log((new Date()) + ' Connection from origin '    + request.origin + '.');
	var connection = request.accept(null, request.origin);
	var index = clients.push(connection) - 1;
	// user disconnected
	connection.on('close', function(connection) {
	});

	connection.on('message', function(message) {
		if (message.type === 'utf8') { // accept only text
			// first message sent by user is their name
			var req = message.utf8Data;
			// var json = JSON.parse(req);
			if (debug) console.log(">>>>>>>>>>>>>>>>>>> Received from client");
			if (debug) var_dump(JSON.parse(req));
			var ns = Netstring.write(req);
			bsClient.write(ns);
		}
	});
	// user disconnected    
});

function broadcast(json) {
	var ret = JSON.parse(json);
	if (debug) console.log("<<<<<<<<<<<<<<<<<<< Received from Baresip");
	if (debug) var_dump(ret);

	for (var i=0; i < clients.length; i++) {
		clients[i].sendUTF(json);
	}
}

/////////////////////////////////////////////////////////////
///////////////////// TCP Client for Baresip
/////////////////////////////////////////////////////////////

var bsClient = new Net.Socket();

bsClient.on('data', function(data) {
	var msgs  = Netstring.read(data).toString();
	var marr = msgs.split("},");
	if (marr.length==1)  {
		broadcast(marr[0]);
	} else {
		marr.forEach(function(m) {
			broadcast(m + "}");
		});
	}
});

bsClient.on('close', function() {
	if (debug) console.log('Connection closed');
	bsConnStat = 0;
});

bsClient.on('error',function(error){
	if (debug) console.log('Error : ' + error);
});

bsClient.on('timeout',function(){
	if (debug) console.log('Socket timed out !');
	bsClient.end('Timed out!');
  // can call socket.destroy() here too.
});

bsClient.on('end',function(data){
	if (debug) console.log('Socket ended from other end!');
	if (debug) console.log('End data : ' + data);
})



bsClient.connect(bsPort, host, function() {
	if (debug) console.log('Connected to BS, port:' + bsPort);
	bsConnStat = 2;
});


var bsConInt = setInterval(bsConnectionCheck, 2000);

function bsConnectionCheck() {
	// console.log("Checking bsConnection, status:" + bsConnStat);
	if (bsConnStat!=0)	return;
	bsConnStat = 1;
	if (debug) console.log("Attempting connection to baresip..");
	bsClient.connect(bsPort, host, function() {
		if (debug) console.log('Connected to BS, port:' + bsPort);
		bsConnStat = 2;
	});
}
