"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpie_1 = require("httpie");
const brushes_1 = __importDefault(require("../brushes"));
const gameplay_1 = require("./gameplay");
const drawingEl = document.querySelector('#drawing');
const drawingCanvas = drawingEl.querySelector('canvas');
const drawingCtx = drawingCanvas.getContext('2d');
function showDrawing(_id) {
    return __awaiter(this, void 0, void 0, function* () {
        drawingEl.classList.remove('hidden');
        gameplay_1.clearCanvas(drawingCtx);
        const data = (yield httpie_1.get(`/drawings/${_id}`)).data;
        data.paths.forEach(path => {
            brushes_1.default[path.brush](drawingCtx, path.color, path.points, false);
        });
    });
}
exports.showDrawing = showDrawing;
function hideDrawing() {
    drawingEl.classList.add('hidden');
}
exports.hideDrawing = hideDrawing;
