"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("@colyseus/schema");
const Player_1 = require("./Player");
var BRUSH;
(function (BRUSH) {
    BRUSH["SKETCH"] = "s";
    BRUSH["MARKER"] = "m";
    BRUSH["PEN"] = "p";
    BRUSH["ERASER"] = "e";
    // ROUNDED = 'r',
})(BRUSH = exports.BRUSH || (exports.BRUSH = {}));
exports.DEFAULT_BRUSH = BRUSH.PEN;
class Path extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.points = new schema_1.ArraySchema();
    }
}
__decorate([
    schema_1.type("string")
], Path.prototype, "brush", void 0);
__decorate([
    schema_1.type("number")
], Path.prototype, "color", void 0);
__decorate([
    schema_1.type(["number"])
], Path.prototype, "points", void 0);
exports.Path = Path;
class State extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.players = new schema_1.MapSchema();
        this.paths = new schema_1.ArraySchema();
    }
    createPlayer(sessionId) {
        this.players[sessionId] = new Player_1.Player();
        return this.players[sessionId];
    }
    removePlayer(sessionId) {
        delete this.players[sessionId];
    }
}
__decorate([
    schema_1.type("number")
], State.prototype, "countdown", void 0);
__decorate([
    schema_1.type({ map: Player_1.Player })
], State.prototype, "players", void 0);
__decorate([
    schema_1.type([Path])
], State.prototype, "paths", void 0);
exports.State = State;
