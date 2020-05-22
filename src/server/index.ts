/*
 * embed webpack-dev-server
 */
let webpack, webpackDevMiddleware, webpackHotMiddleware, webpackConfig;
if (process.env.NODE_ENV !== "production") {
    webpack = require("webpack");
    webpackDevMiddleware = require("webpack-dev-middleware");
    webpackConfig = require("../../webpack.config");
    webpackHotMiddleware = require("webpack-hot-middleware");
}

import { Server } from "colyseus";
import http from "http";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import basicAuth from "express-basic-auth";
import socialRoutes from "@colyseus/social/express";
import { monitor } from "@colyseus/monitor";

import { DrawingRoom } from "./rooms/DrawingRoom";

export const port = Number(process.env.PICTIONARY_PORT || 8080);
export const endpoint = "localhost";

export let STATIC_DIR: string;

const app = express();
app.use(bodyParser.json())
const gameServer = new Server({ server: http.createServer(app) });

const timeMapping = {
    "5minutes": 500,
    "10minutes": 500,
    "15minutes": 500
}

if (process.env.NODE_ENV !== "production") {
    const webpackCompiler = webpack(webpackConfig({}));
    app.use(webpackDevMiddleware(webpackCompiler, {}));
    app.use(webpackHotMiddleware(webpackCompiler));

    // on development, use "../../" as static root
    STATIC_DIR = path.resolve(__dirname, "..", "..");

} else {
    // on production, use ./public as static root
    STATIC_DIR = path.resolve(__dirname, "public");
}

app.use("/", express.static(STATIC_DIR));

// @colyseus/social routes
app.use("/", socialRoutes);

// add colyseus monitor
const auth = basicAuth({ users: { 'admin': 'admin' }, challenge: true });
app.use("/colyseus", auth, monitor(gameServer));

app.get("/game/:id", (req, res) => {
    console.log("defining new drawing room: " + req.params.id);
    gameServer.define(req.params.id, DrawingRoom, { expiration: 60 * 500 });
    res.end('ok');
;});

gameServer.listen(port);
console.log(`Listening on http://${endpoint}:${port}`);
