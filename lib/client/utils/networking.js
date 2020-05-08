"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colyseus_js_1 = require("colyseus.js");
const protocol = location.protocol.replace("http", "ws");
const port = (location.port && `:${location.port}`);
const host = location.hostname;
exports.client = new colyseus_js_1.Client(`${protocol}//${host}${port}`);
