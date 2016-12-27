#!/usr/bin/env node
// coding: utf-8

function _startup() {

}

function handler_template_example1(req, res, next) {

	//
	// テンプレートファイルを利用してコンテンツを返却します。
	//
	var content = {name: "中臣鎌足"};
	res.render("dashboard.ejs", content);
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

function main() {

	//
	// setup
	//
	var express = require("express");
	var ejs_template_engine = require("ejs")
	var app = express();
	app.set('view engine', 'ejs')
	var server = app.listen(8080, _startup);

	console.log("Node.js is listening to port: " + server.address().port);

	//
	// routing
	//
	app.get("/hello", handler_simple_json);
	app.get("/example1", handler_template_example1);
}

main();

