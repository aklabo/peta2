#!/usr/bin/env node
// coding: utf-8



///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

var util = {

	zero_pad: function(color) {
		if (color.length == 1)
			return "0" + color;
		return color;
	},

	rgb: function(r, g, b) {
		r = (r).toString(16);
		g = (g).toString(16);
		b = (b).toString(16);
		return "#" + util.zero_pad(r) + util.zero_pad(g) + util.zero_pad(b);
	},

	generate_new_color: function() {
		var r = 200 + Math.floor(Math.random() * 56);
		var g = 200 + Math.floor(Math.random() * 56);
		var b = 200 + Math.floor(Math.random() * 56);
		return util.rgb(r, g, b);
	},

	get_timestamp: function() {
		var date = new Date();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var hour = date.getHours();
		var min = date.getMinutes();
		var sec = date.getSeconds();
		var millisec = date.getMilliseconds();
		month = (month < 10 ? "0" : "") + month;
		day = (day < 10 ? "0" : "") + day;
		hour = (hour < 10 ? "0" : "") + hour;
		min = (min < 10 ? "0" : "") + min;
		sec = (sec < 10 ? "0" : "") + sec;
		millisec = (millisec < 100 ? "00" : "") + millisec;
		return "" + date.getFullYear() + "-" + month + "-" + day + " " +  hour + ":" + min + ":" + sec + "." + millisec;
	}
};








///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var logger = {

	info: function(message) {
		try {
			require("json");
			var fs = require("fs");
			fs.appendFileSync("peta2.log", util.get_timestamp() + " [INFO] " + message + "\n", {encoding: "utf-8"});
		}
		catch (ex) {
			console.log(ex);
			console.log("[ERROR] ログ出力に失敗しています。");
		}
	},

	trace: function(message) {
		try {
			require("json");
			var fs = require("fs");
			fs.appendFileSync("peta2.log", util.get_timestamp() + " [TRACE] " + message + "\n", {encoding: "utf-8"});
		}
		catch (ex) {
			console.log(ex);
			console.log("[ERROR] ログ出力に失敗しています。");
		}
	},

	error: function(message) {
		try {
			require("json");
			var fs = require("fs");
			fs.appendFileSync("peta2.log", util.get_timestamp() + " [ERROR] " + message + "\n", {encoding: "utf-8"});
		}
		catch (ex) {
			console.log(ex);
			console.log("[ERROR] ログ出力に失敗しています。");
		}
	}
};










///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function _load_json_file(path) {

	try {
		require("json");
		var fs = require("fs");
		return JSON.parse(fs.readFileSync(path, "utf-8"));
	}
	catch (ex) {
		logger.info(ex);
		logger.info("[info] ファイルが存在しません。");
		return {}
	}
}

function _save_box(m) {

	try {
		var tree_object = _load_json_file(".peta2-boxes-data.json");
		require("json");
		if (tree_object["data"] == null) {
			tree_object["data"] = [];
		}
		boxes_array = tree_object["data"];
		boxes_array.push(m);
		var fs = require("fs");
		var json_data = JSON.stringify(tree_object, null, "\t");
		fs.writeFileSync(".peta2-boxes-data.json", json_data, {encoding: "utf-8"});
	}
	catch (err) {
		logger.trace(err);
		logger.error("json データの保存に失敗しています。");
	}
}

function application() {

	this._sessions = 0;

	this._io = null;

	this._on_new_peer = function(socket) {

		logger.trace("Welcome! << (ﾟ _ﾟ )))");
		this._sessions++;
		logger.info("(" + this._sessions + ") connection(s) alive.");
		this._io.emit("sessions changed", {count: this._sessions});
		var peer = new peer_connection(this, this._io, socket);
	}.bind(this);

	this._handler_template_dashboard = function(req, res, next) {

		var content = {name: "中臣鎌足"};
		res.render("dashboard.ejs", content);
	}.bind(this);

	this._handler_template_preferences = function(req, res, next) {

		var content = {name: "中臣鎌足"};
		res.render("preferences.ejs", content);
	}.bind(this);

	this._handler_simple_root = function(req, res, next) {

		res.redirect("/dashboard");
	}.bind(this);

	this._handler_simple_json = function(req, res, next) {

		var content = {
			status: "OK",
			message_text: "Hello",
			timestamp: new Date()
		};
		res.json(content);
	}.bind(this);

	this._handler_load_boxex = function(req, res, next) {

		try {
			var json = _load_json_file(".peta2-boxes-data.json");
			res.json(json);
		}
		catch (err) {
			logger.trace(err);
			logger.error("json データの読み込みに失敗しています。");
			res.json({});
		}
	}.bind(this);

	this._handler_on_ready = function() {

	}.bind(this);

	this.run = function(options) {

		logger.info("### START ###");
		logger.info("runnung on [" + __dirname + "]");
		logger.info("running with options " + JSON.stringify(options));

		// アプリケーションの初期化
		require("ejs");
		var express = require("express");
		var app = express();
		app.set("view engine", "ejs");
		app.use("/static", express.static("public"));
		var http = require("http").Server(app);
		this._io = require("socket.io")(http);

		// ルーティング設定
		app.get("/", this._handler_simple_root);
		app.get("/hello", this._handler_simple_json);
		app.get("/dashboard", this._handler_template_dashboard);
		app.get("/preferences", this._handler_template_preferences);
		app.get("/boxes", this._handler_load_boxex);

		// Socket.IO のイベント設定
		this._io.on("connection", this._on_new_peer);

		// サーバーを起動
		var server = http.listen(options["port"], this._handler_on_ready);

		if (server.address() != null)
			logger.info("Node.js is listening to port: " + server.address().port);
		else
			logger.info("Node.js is listening to port: (unknown)");
	}.bind(this);
}






///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function peer_connection(owner, io, socket) {

	this._owner = owner;
	this._io = io;
	this._socket = socket;

	this._on_disconnect = function(m) {
		logger.trace("Bye... >> ((( ﾟ_ ﾟ)");
		this._owner._sessions--;
		logger.info("(" + this._owner._sessions + ") connection(s) alive.");
		this._io.emit("sessions changed", {count: this._owner._sessions});
	}.bind(this);

	this._on_chat_message = function(m) {
		const uuid4 = require("uuid/v4");
		logger.trace("caught message: {x:" + m.x +", y:" + m.y + ", text:" + m.text + "} << (PEER)");
		logger.trace("BROADCAST! >> (EVERYONE)");
		m.id = uuid4();
		m.background_color = util.generate_new_color();
		_save_box(m);
		this._io.emit("chat message", m);
	}.bind(this);

	socket.on("disconnect", this._on_disconnect);
	socket.on("chat message", this._on_chat_message);
}






///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function _read_commandline_arguments() {

	const args = require("command-line-args");
	const def = [
		{name: "help", alias: "h", type: Boolean},
		{name: "host", type: String, defaultValue: "127.0.0.1"},
		{name: "port", alias: "p", type: Number, defaultValue: 80}
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

function _main() {

	const options = _read_commandline_arguments();
	if (options["help"]) {
		_usage();
		return;
	}

	var app = new application();
	app.run(options);
}

_main(process.argv);
