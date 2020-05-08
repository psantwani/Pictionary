"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getRGB(argb) {
    const b = (argb) & 0xFF;
    const g = (argb >> 8) & 0xFF;
    const r = (argb >> 16) & 0xFF;
    const a = (argb >> 24) & 0xFF;
    return { r, g, b, a };
}
exports.getRGB = getRGB;
function toHex(argb) {
    return "#" + argb.toString(16).padStart(6, "0");
}
exports.toHex = toHex;
