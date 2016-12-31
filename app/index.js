#!/usr/bin/env node
// coding: utf-8

var __sessions = 0;

function _startup() {

}

function _handler_template_dashboard(req, res, next) {

	var content = {name: "中臣鎌足"};
	res.render("dashboard.ejs", content);
}

function _handler_template_preferences(req, res, next) {

	var content = {name: "中臣鎌足"};
	res.render("preferences.ejs", content);
}

function _handler_simple_root(req, res, next) {

	res.redirect("/dashboard");
}

function _handler_simple_json(req, res, next) {

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

function _handler_load_boxex(req, res, next) {

	try {
		var json = _load_json_file("/tmp/.peta2-boxes-data.json");
		res.json(json);
	}
	catch (err) {
		console.log(err);
		console.log("[error] json データの読み込みに失敗しています。");
		res.json({});
	}
}

function _read_arguments() {

	const args = require('command-line-args');
	const def = [
		{name: 'help', alias: 'h', type: Boolean},
		{name: 'host', type: String, defaultValue: "127.0.0.1"},
		{name: 'port', alias: 'p', type: Number, defaultValue: 80}
	];
	return args(def);
}

function _usage() {

	console.log("USAGE:");
	console.log("    --help: show this message.");
	console.log("    --host: interface to listen.");
	console.log("    --port: port to listen.");
	console.log("");
}

function main() {

	// ========================================================================
	// コマンドラインオプションの取り出し
	// ========================================================================
	const options = _read_arguments();
	if (options['help']) {
		_usage();
		return;
	}

	console.log("[trace] runnung on [" + __dirname + "]");
	console.log("[trace] running with options " + JSON.stringify(options));

	// ========================================================================
	// アプリケーションの初期化
	// ========================================================================
	var express = require("express");
	require("ejs")
	var app = express();
	app.set('view engine', 'ejs');
	var http = require('http').Server(app);
	var io = require('socket.io')(http);

	// ========================================================================
	// ルーティング設定
	// ========================================================================
	app.get("/", _handler_simple_root);
	app.get("/hello", _handler_simple_json);
	app.get("/dashboard", _handler_template_dashboard);
	app.get("/preferences", _handler_template_preferences);
	app.get("/boxes", _handler_load_boxex);

	// ========================================================================
	// Socket.IO のイベント設定
	// ========================================================================
	io.on('connection', function(socket) {
		console.log('[TRACE] Welcome! << (ﾟ _ﾟ )))');
		__sessions++;
		io.emit('sessions changed', {count: __sessions});
		socket.on('disconnect', function() {
			console.log('[TRACE] Bye... >> ((( ﾟ_ ﾟ)');
			__sessions--;
			io.emit('sessions changed', {count: __sessions});
		});
		socket.on('chat message', function(m) {
			console.log('[TRACE] caught message: {x:' + m.x +", y:" + m.y + ", text:" + m.text + "} << (PEER)");
			console.log('[TRACE] BROADCAST! >> (EVERYONE)');
			io.emit('chat message', m);
		});
	});

	// ========================================================================
	// サーバーを起動
	// ========================================================================
	var server = http.listen(options["port"], _startup);
	console.log("Node.js is listening to port: " + server.address().port);
}

main(process.argv);
