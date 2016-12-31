#!/usr/bin/env node
// coding: utf-8

function _startup() {

}

function handler_template_dashboard(req, res, next) {

	var content = {name: "中臣鎌足"};
	res.render("dashboard.ejs", content);
}

function handler_template_preferences(req, res, next) {

	var content = {name: "中臣鎌足"};
	res.render("preferences.ejs", content);
}

function handler_simple_root(req, res, next) {

	res.redirect("/dashboard");
}

function handler_simple_json(req, res, next) {

	//
	// json
	//
	var content = {
		status: "OK",
		message_text: "Hello",
		timestamp: new Date()
	};

	res.json(content);
}

function _load_json_file(path) {

	require("json");
	var fs = require("fs");
	return JSON.parse(fs.readFileSync(path, "utf8"));
	return "" + fs.readFileSync(path, "utf8");
}

function handler_load_boxex(req, res, next) {

	try {
		var json = _load_json_file("/tmp/.peta2-boxes-data.json");
		res.json(json);
	}
	catch (err) {
		console.log(err);
		console.log("[ERROR] json データの読み込みに失敗しています。");
		res.json({});
	}
}

function main() {

	var express = require("express");
	var ejs_template_engine = require("ejs")
	var app = express();
	app.set('view engine', 'ejs');
	var http = require('http').Server(app);
	var io = require('socket.io')(http);

	app.get("/", handler_simple_root);
	app.get("/hello", handler_simple_json);
	app.get("/dashboard", handler_template_dashboard);
	app.get("/preferences", handler_template_preferences);
	app.get("/boxes", handler_load_boxex);

	io.on('connection', function(socket) {
		console.log('[TRACE] Welcome! << (ﾟ _ﾟ )))');
		socket.on('disconnect', function() {
			console.log('[TRACE] Bye... >> ((( ﾟ_ ﾟ)');
		});
		socket.on('chat message', function(m) {
			console.log('[TRACE] caught message: {x:' + m.x +", y:" + m.y + ", text:" + m.text + "} << (PEER)");
			console.log('[TRACE] BROADCAST! >> (EVERYONE)');
			io.emit('chat message', m);
		});
	});

	var server = http.listen(8080, _startup);
	console.log("Node.js is listening to port: " + server.address().port);
}

main(process.argv);
