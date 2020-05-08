import { client } from './../utils/networking';
import { Player } from './../../server/rooms/Player';
import { Room } from "colyseus.js";
import { State, DEFAULT_BRUSH, BRUSH } from "../../server/rooms/State";
import brushFunctions from "../brushes";
import Swal from 'sweetalert2';
import { list } from '../utils/wordlist';

let room: Room<State>;

const COUNTDOWN_TIMER = 120;

const gameplay = document.getElementById('gameplay');
const clearCanvasBtn = document.getElementById('clear-canvas-btn');
const countdownEl = gameplay.querySelector('.countdown');
const wordAreaEl = document.getElementById('word-area');
const pointsEl = document.getElementById('points');
const correctBtnEl = <HTMLInputElement> document.getElementById('correct-answer');

const peopleEl = gameplay.querySelector('.people');
const chatEl = gameplay.querySelector('.chat');
const chatMessagesEl = chatEl.querySelector('ul');


let gameStarted = false;
let currTurnToDraw;
let myPlayerId;
let myPlayerScore = 0;
let oppositionPlayerId;
let oppositionPlayerScore = 0;
let currWord;
let players = {};
let wordListKeys = Object.keys(list);
let countdownInterval;

chatEl.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = chatEl.querySelector('input[type=text]') as HTMLInputElement;
  room.send(['chat', input.value]);
  input.value = "";
});

gameplay.querySelector('.info a').addEventListener("click", (e) => {
  e.preventDefault();
  location.hash = "#";
});

correctBtnEl.addEventListener("click", (e) => {
  e.preventDefault();
  if (room != null) {
    room.send(['show-answer', true]);
  }
});

const canvas = gameplay.querySelector('.drawing') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const prevCanvas = gameplay.querySelector('.drawing-preview') as HTMLCanvasElement;
const prevCtx = prevCanvas.getContext('2d');

clearCanvasBtn.addEventListener("click", (e) => {
  e.preventDefault();
  clearCanvas(ctx);
  clearCanvas(prevCtx);
});

export async function showGameplay(roomName: string) {
  chatMessagesEl.innerHTML = "";
  peopleEl.innerHTML = "";
  gameplay.querySelector('.mode').innerHTML = `${roomName} session`;

  clearCanvas(ctx);
  clearCanvas(prevCtx);

  gameplay.classList.add('loading');

  let username;
  let { value } = await Swal.fire({
    title: 'Enter Nickname',
    input: 'text',
    inputValue: '',
    showCancelButton: false,
    inputValidator: (value) => {
      if (!value) {
        return "Oh C'mon!"
      }
    }
  })

  if (value) {
    username = value;
  } else {
    location.href = "/";
    return;
  }

  room = await client.joinOrCreate(roomName, {
    nickname: username
  });

  room.onStateChange.once(() => gameplay.classList.remove('loading'));

  room.state.players.onAdd = (player, sessionId) => {
    showToast(`${player.name} joined`, 'success');
  }

  room.state.players.onRemove = (player, sessionId) => {
    showToast(`${player.name} left`, 'error');
  }

  room.state.onChange = (changes) => {
    if (changes[0].field == "players") {
      playerUpdate(room, changes[0]);
    }
  };

  room.state.paths.onAdd = function(path, index) {
    brushFunctions[path.brush](ctx, path.color, path.points, false);
  }

  room.onMessage((message) => {
    const [cmd, data] = message;
    if (cmd === "chat") {
      const message = document.createElement("li");
      message.innerText = data;
      chatMessagesEl.appendChild(message);
      chatEl.scrollTop = chatEl.scrollHeight;
    } else if (cmd === "show-word") {
      showWord(data);
    } else if (cmd === "one-turn") {
      oneTurn();
    } else if (cmd === "start-countdown") {
      startCountdown(data);
    } else if (cmd === "show-answer") {
      console.log(data);
      showAnswerAndSwitchTurn(data);
    } else if (cmd === "next-turn") {
      nextTurn(data);
    }
  });
}

function playerUpdate(room, change) {
  const currPlayers = Object.keys(change.value);
  if (myPlayerId) {
    oppositionPlayerId = currPlayers[0] == myPlayerId ? currPlayers[1] : currPlayers[0];
    if (oppositionPlayerId) {
      players[oppositionPlayerId] = (change.value[oppositionPlayerId] as Player).name;
    }
  }
  else if (!myPlayerId) {
    myPlayerId = currPlayers[currPlayers.length - 1];
    players[myPlayerId] = (change.value[myPlayerId] as Player).name;
  }
  if (currPlayers.length < 2) {
    gameStarted = false;
    hideGameplay();
    waitingForPlayerNotification(room);
  }
  if (!gameStarted && currPlayers.length == 2 && oppositionPlayerId != undefined) {
    currTurnToDraw = currPlayers[0];
    startGameNotification(room);
    gameStarted = true;
  }
}

function startGameNotification(room) {
    let timerInterval;
    Swal.fire({
      title: 'Game start alert!',
      html: 'We will start in <b></b> seconds.',
      timer: 4000,
      timerProgressBar: true,
      onBeforeOpen: () => {
        Swal.showLoading()
        timerInterval = setInterval(() => {
          const content = Swal.getContent()
          if (content) {
            const b = content.querySelector('b')
            if (b) {
              let timeLeft = Swal.getTimerLeft() || 0;
              let timeLeftInSecs = Math.floor(timeLeft / 1000);
              b.textContent = timeLeftInSecs.toString();
            }
          }
        }, 1000)
      },
      onClose: () => {
        room.send(["one-turn"]);
        clearInterval(timerInterval);
      }
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
        gameplay.classList.remove('hidden');
      }
    });
}


function waitingForPlayerNotification(room) {
  let timerInterval;
  Swal.fire({
    title: 'Waiting for Players!',
    html: 'Game will wait for <b></b> seconds for other players to join.',
    timer: 180000,
    timerProgressBar: true,
    onBeforeOpen: () => {
      Swal.showLoading()
      timerInterval = setInterval(() => {
        const content = Swal.getContent()
        if (content) {
          const b = content.querySelector('b')
          if (b) {
            let timeLeft = Swal.getTimerLeft() || 0;
            let timeLeftInSecs = Math.floor(timeLeft / 1000);
            b.textContent = timeLeftInSecs.toString();
          }
        }
      }, 1000)
    },
    onClose: () => {
      clearInterval(timerInterval)
      location.href = "/";
    }
  });
}

function oneTurn() {
  correctBtnEl.disabled = true;
  currWord = "";
  countdownEl.innerHTML = "";
  clearCanvas(ctx);
  clearCanvas(prevCtx);
  let willDraw = false;
  let willGuess = false;
  if (myPlayerId == currTurnToDraw) {
    willDraw = true;
  } else {
    willGuess = true;
  }

  if (willDraw) {
    canvas.style.pointerEvents = "all";
    prevCanvas.style.pointerEvents = "all";
    correctBtnEl.style.display = "block";
    wordAreaEl.style.cssText = 'display:none';
  } else {
    canvas.style.pointerEvents = "none";
    prevCanvas.style.pointerEvents = "none";
    correctBtnEl.style.display = "none";
    wordAreaEl.innerText = "Word Hint Will Appear Here";
    wordAreaEl.style.cssText = 'display:block';
  }

  setTimeout(() => {
    showToast(`${players[currTurnToDraw]}'s turn to draw.`, 'success');
  }, 1000);

  if (willDraw) {
    setTimeout(() => {
      chooseWordAndStartCountdown();
    }, 5000);
  }
}

async function chooseWordAndStartCountdown() {
  if (myPlayerId == currTurnToDraw) {
    const { value: word } = await Swal.fire({
      title: 'Select word',
      input: 'select',
      inputOptions: pickRandomWords(3),
      inputPlaceholder: 'Select a word',
      showCancelButton: false,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          resolve()
        })
      }
    })

    if (word) {
      Swal.fire({
        title: `You selected: ${word}`,
        html: `Good luck, ${players[myPlayerId]}`,
        timer: 3000,
        timerProgressBar: true,
        onBeforeOpen: () => {
          Swal.showLoading();
        },
        onClose: () => {
          correctBtnEl.disabled = false;
          room.send(['show-word', word]);
          room.send(['start-countdown', currTurnToDraw]);
        }
      });
    }
  }
}

function pickRandomWords(num) {
  let randomWords = {};
  while (num > 0) {
    var randomKey = wordListKeys[Math.floor(Math.random() * wordListKeys.length)];
    let presentation = `${randomKey} : ${list[randomKey]}`;
    randomWords[presentation] = presentation;
    num--;
  }

  return randomWords;
}

function showWord(word) {
  let englishWord = word.split(" : ")[0];
  let hindiWord = word.split(" : ")[1];
  currWord = `${englishWord} (${hindiWord})`;
  if (myPlayerId == currTurnToDraw) {
    wordAreaEl.innerText = `${englishWord} (${hindiWord}) `
  } else {
    let guessWord =  "_ ".repeat(englishWord.length);
    wordAreaEl.innerText = guessWord;
  }
}

function startCountdown(currTurnToDraw) {
  let value = COUNTDOWN_TIMER;
   countdownInterval = setInterval(() => {
    countdownEl.innerHTML = (value > 0) ? millisecondsToStr(value) : "Time is up!";
    value--;
    if (value < 0) {
      showToast("Time is up", "error");
      clearInterval(countdownInterval);
      room.send(['show-answer', false]);
    }
  }, 1000);
}

function showAnswerAndSwitchTurn(guessed) {
  scoreCalculation(guessed);
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  let timerInterval;
  Swal.fire({
    title: `Answer: ${currWord}`,
    html: `<table>
            <tr>
              <th>Player</th><th>Score</th>
            </tr>
            <tr>
              <td>${players[myPlayerId]}</td><td>${myPlayerScore}</td>
            </tr>
            <tr>
            <td>${players[oppositionPlayerId]}</td><td>${oppositionPlayerScore}</td>
            </tr>
          </table>`,
    timer: 5000,
    timerProgressBar: true,
    onBeforeOpen: () => {
      Swal.showLoading()
      timerInterval = setInterval(() => {
      }, 1000)
    },
    onClose: () => {
      if (currTurnToDraw == myPlayerId) {
        let nextPlayerToDraw = currTurnToDraw == myPlayerId ? oppositionPlayerId : myPlayerId;
        room.send(['next-turn', nextPlayerToDraw]);
      }
    }
  });
}

function scoreCalculation(guessed) {
  console.log("scoreCalculation", guessed);
  if (guessed) {
    if (currTurnToDraw == myPlayerId) {
      myPlayerScore += 50;
      oppositionPlayerScore += 100;
    } else {
      myPlayerScore += 100;
      oppositionPlayerScore += 50;
    }
  }
  pointsEl.innerText = myPlayerScore.toString();
}

function nextTurn(nextToDraw) {
  currTurnToDraw = nextToDraw;
  room.send(['one-turn']);
}

function showToast(title, icon) {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    onOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  Toast.fire({
    icon,
    title
  });

  return true;
}

export function hideGameplay() {
  gameplay.classList.add('hidden');
}

export function clearCanvas(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function checkRoom() {
  return (room && room.state.countdown > 0);
}

ctx.lineWidth = 1;
ctx.lineJoin = ctx.lineCap = 'round';

var isDrawing, color = 0x000000, brush = DEFAULT_BRUSH, points = [ ];

prevCanvas.addEventListener("mousedown", (e) => startPath(e.offsetX, e.offsetY));
prevCanvas.addEventListener("mousemove", (e) => movePath(e.offsetX, e.offsetY));
prevCanvas.addEventListener("mouseup", (e) => endPath());

prevCanvas.addEventListener("touchstart", (e) => {
  var rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
  var bodyRect = document.body.getBoundingClientRect();
  var x = e.touches[0].pageX - (rect.left - bodyRect.left);
  var y = e.touches[0].pageY - (rect.top - bodyRect.top);
  return startPath(x, y);
});
prevCanvas.addEventListener("touchmove", (e) => {
  var rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
  var bodyRect = document.body.getBoundingClientRect();
  var x = e.touches[0].pageX - (rect.left - bodyRect.left);
  var y = e.touches[0].pageY - (rect.top - bodyRect.top);
  movePath(x, y)
});
prevCanvas.addEventListener("touchend", (e) => endPath());

/**
 * Tools: colorpicker
 */
gameplay.querySelector('.colorpicker').addEventListener("change", (e) => {
  color = parseInt("0x" + (e.target as HTMLInputElement).value);
});

/**
 * Tools: brush
 */
Array.from(document.querySelectorAll('input[type=radio][name="brush"]')).forEach(radioButton => {
  radioButton.addEventListener('change', (e) => {
    brush = (e.target as HTMLInputElement).value as BRUSH;
  });
});

function startPath(x, y) {
  if (!checkRoom()) { return; }

  const point = [x, y];
  room.send(['s', point, color, brush]);

  clearCanvas(prevCtx);

  isDrawing = true;
  points = [];
  points.push(...point);
}

function movePath(x, y) {
  if (!checkRoom()) { return; }
  if (!isDrawing) { return; }

  const point = [x, y];
  room.send(['p', point]);

  points.push(...point);
  brushFunctions[brush](prevCtx, color, points, true);
}

function endPath() {
  room.send(['e']);

  isDrawing = false;
  points.length = 0;

  clearCanvas(prevCtx);
}


function millisecondsToStr(_seconds) {
  let temp = _seconds;
  const years = Math.floor(temp / 31536000),
    days = Math.floor((temp %= 31536000) / 86400),
    hours = Math.floor((temp %= 86400) / 3600),
    minutes = Math.floor((temp %= 3600) / 60),
    seconds = temp % 60;

  if (days || hours || seconds || minutes) {
    return (years ? years + "y " : "") +
      (days ? days + "d " : "") +
      (hours ? hours + "h " : "") +
      (minutes ? minutes + "m " : "") +
      seconds + "s";
  }

  return "< 1s";
}