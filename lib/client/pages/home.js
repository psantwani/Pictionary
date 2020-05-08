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
Object.defineProperty(exports, "__esModule", { value: true });
const room_generator_1 = require("../../server/utils/room_generator");
const home = document.getElementById('home');
Array.from(home.querySelectorAll('ul li a')).forEach((joinSessionLink) => {
    joinSessionLink.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const roomNumber = room_generator_1.makeid(8);
        yield fetch(`${location.href}game/${roomNumber}`);
        location.hash = roomNumber;
    }));
});
function showHome() {
    return __awaiter(this, void 0, void 0, function* () {
        home.classList.remove('hidden');
        /*
        const previousSessionsEl = home.querySelector('.previous-sessions');
        previousSessionsEl.innerHTML = "";
      
        const drawings = (await get('/drawings')).data;
        drawings.forEach(drawing => {
          const drawingEl = document.createElement('li');
          const drawingAnchorEl = document.createElement('a');
          drawingAnchorEl.href = `#${drawing._id}`;
          drawingAnchorEl.innerText = `${drawing.mode} (${drawing.createdAt})`;
      
          drawingEl.appendChild(drawingAnchorEl);
          previousSessionsEl.appendChild(drawingEl);
      
        });
        console.log(drawings);
        */
    });
}
exports.showHome = showHome;
function hideHome() {
    home.classList.add('hidden');
}
exports.hideHome = hideHome;
