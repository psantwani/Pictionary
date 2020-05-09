import "./css/index.css";
import "./thirdparty/jscolor";
import { showHome, hideHome } from "./pages/home";
import { hideGameplay, showGameplay } from "./pages/gameplay";

document.getElementById('player').addEventListener("click", (e) => {
  (<HTMLAudioElement>document.getElementById("player")).play();
});

/**
 * Navigation
 */
window.addEventListener("hashchange", (e) => {
  const hash = window.location.hash.substr(1);
  if (hash.length === 0) {
    showHome();
    hideGameplay();
  } else {
    showGameplay(hash);
    hideHome();
  }
});

window.addEventListener("load", (e) => {
  const hash = window.location.hash.substr(1);
  if (hash.length === 0) {
    showHome();
    hideGameplay();
  } else {
    showGameplay(hash);
    hideHome();
  }
});