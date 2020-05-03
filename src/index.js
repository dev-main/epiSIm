import Paddle from "/src/paddle";
import Cover from "/src/cover";
import { join } from "path";
var constants = require("./constants");
var canvas = document.getElementById("gameScreen");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//canvas.style.position = "absolute"; // If you need
var ctx = canvas.getContext("2d");

let GAME_WIDTH = canvas.clientWidth;
let GAME_HEIGHT = canvas.clientHeight;

const userAgent = window.navigator.userAgent;

const iPadSafari =
  !!userAgent.match(/iPad/i) && // Detect iPad first.
  !!userAgent.match(/WebKit/i) && // Filter browsers with webkit engine only
  !userAgent.match(/CriOS/i) && // Eliminate Chrome & Brave
  !userAgent.match(/OPiOS/i) && // Rule out Opera
  !userAgent.match(/FxiOS/i) && // Rule out Firefox
  !userAgent.match(/FocusiOS/i); // Eliminate Firefox Focus as well!

const element = document.getElementById("fullScreenButton");

//--- coverpage
var cover = new Cover();
cover.draw();

var fontBase = GAME_WIDTH; // selected default width for canvas
var fontSize = 70; // default size for font

//red
let paddlea = new Paddle(ctx, "#f00", GAME_HEIGHT - 100 - 10);
paddlea.setCollisionIdentifier(constants.marker_BLUE);
//blue
let paddleb = new Paddle(ctx, "#00f", 100);
paddleb.setCollisionIdentifier(constants.marker_RED);

let gamestate = 0;

var enemies;

//matrix with collision states
//0 noting is there
//1
var collisionState = undefined;

let x1 = GAME_WIDTH / 2;
let y1 = GAME_HEIGHT / 2;
var extpercent = 0.1;

var backGroundColor = "white";
var wallColor = "black";
var wallLineColor = "LightGrey";
var floorColor = "black";

var musicPlaying = false;

var myMusic = new sound("never_stop.mp3", true);
var crash = new sound("Smashing-Yuri_Santana-1233262689.mp3", false);

addEventListeners();

//--- the game
function startNewGame() {
  if (!musicPlaying) {
    musicPlaying = true;
    try {
      myMusic.play();
    } catch (err) {
      console.log(err);
    }
  }
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = backGroundColor;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  drawMatrix();

  ininializeCollisionState();
  gamestate = 1;

  paddlea.setPosition(GAME_WIDTH / 2, GAME_HEIGHT - 100);
  paddlea.setDirection(0);
  paddleb.setPosition(GAME_WIDTH / 2, 100);
  paddleb.setDirection(2);

  enemies = initializeEnemies();
  drawEnemies();
  initializeEnemyVisuals();
  gameloop();
}

function gameloop(timestamp) {
  if (gamestate == 0) return;

  drawEnemyVisuals();
  paddlea.step();
  detectCollision(paddlea, paddleb);
  paddlea.draw();
  drawPoints(paddlea);

  paddleb.step();
  detectCollision(paddleb, paddlea);
  paddleb.draw();
  drawPoints(paddleb);

  requestAnimationFrame(gameloop);
}
//----- functions

function iOS() {
  if (userAgent.match(/ipad|iphone|ipod/i)) {
    const iOS = {};
    iOS.majorReleaseNumber = +userAgent
      .match(/OS (\d)?\d_\d(_\d)?/i)[0]
      .split("_")[0]
      .replace("OS ", "");
    return iOS;
  }
}
const _toggleFullScreen = function _toggleFullScreen() {
  if (
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement
  ) {
    /*
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else {
      if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else {
        if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    }
    */
  } else {
    const _element = document.documentElement;
    if (_element.requestFullscreen) {
      _element.requestFullscreen();
    } else {
      if (_element.mozRequestFullScreen) {
        _element.mozRequestFullScreen();
      } else {
        if (_element.webkitRequestFullscreen) {
          _element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      }
    }
  }
};

if (element !== null) {
  if (userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
    element.className += " hidden";
  } else if (userAgent.match(/iPad/i) && iOS().majorReleaseNumber < 12) {
    element.className += " hidden";
  } else if (userAgent.match(/iPad/i) && !iPadSafari) {
    element.className += " hidden";
  } else {
    element.addEventListener("click", _toggleFullScreen, false);
  }
}

function drawMatrix() {
  var spacing = 10;

  for (var i = spacing / 2; i <= GAME_WIDTH; i = i + spacing) {
    line(i, 0, i, GAME_HEIGHT, "blue");
  }

  for (var j = spacing / 2; j <= GAME_HEIGHT; j = j + spacing) {
    var aColor = "blue";

    if (j < GAME_HEIGHT / 4 || j > GAME_HEIGHT - GAME_HEIGHT / 4) {
      aColor = "green";
    }
    line(0, j, GAME_WIDTH, j, aColor);
  }
}
function sound(src, loop) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.loop = loop;
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function() {
    this.sound.play();
  };
  this.stop = function() {
    this.sound.pause();
  };
}

function addEventListeners() {
  document.addEventListener(
    "touchmove",
    function(event) {
      event.preventDefault();
      event.stopPropagation();
    },
    false
  );

  canvas.addEventListener(
    "touchmove",
    function(event) {
      event.preventDefault();
      event.stopPropagation();
    },
    false
  );
  document.addEventListener("keyup", function(event) {
    switch (event.keyCode) {
      case "X".charCodeAt(0): //X 88
        paddlea.setDirection(paddlea.direction + 1);
        break;
      case "Y".charCodeAt(0): //y 89
        paddlea.setDirection(paddlea.direction - 1);
        break;
      case "N".charCodeAt(0): //A
        paddleb.setDirection(paddleb.direction - 1);
        break;
      case "M".charCodeAt(0):
        paddleb.setDirection(paddleb.direction + 1);
        break;
      default:
        startNewGame();
        //console.log("default", event.keyCode);
        break;
    }
  });

  canvas.addEventListener(
    "touchend",
    function(event) {
      for (var i = 0; i < event.changedTouches.length; i++) {
        let touchX = event.changedTouches[i].clientX;
        let touchY = event.changedTouches[i].clientY;
        if (
          touchY > GAME_HEIGHT / 4 &&
          touchY < GAME_HEIGHT - GAME_HEIGHT / 4
        ) {
          //_toggleFullScreen();
          startNewGame();
          return;
        }
        if (touchY < GAME_HEIGHT / 2) {
          if (touchX > GAME_WIDTH / 2) {
            paddleb.setDirection(paddleb.direction - 1);
          } else {
            paddleb.setDirection(paddleb.direction + 1);
          }
        } else {
          if (touchX > GAME_WIDTH / 2) {
            paddlea.setDirection(paddlea.direction + 1);
          } else {
            paddlea.setDirection(paddlea.direction - 1);
          }
        }
      }
    },
    false
  );
}

function ininializeCollisionState() {
  if (collisionState == undefined) {
    collisionState = [];
    for (var k = 0; k < GAME_WIDTH; k++) {
      collisionState[k] = [];
    }
  }
  for (var i = 0; i < GAME_WIDTH; i++) {
    //console.log("init i:", i);
    for (var j = 0; j < GAME_HEIGHT; j++) {
      //console.log("i;", i, "j:", j);
      collisionState[i][j] = constants.marker_NOTHING;
    }
  }
}

function initializeEnemies() {
  let numberofEnemies = 20;
  var walldistance = 35;
  var enemies = [];
  //paddle reservation places
  var a = new Paddle(ctx, "#000", 0);
  a.setPosition(paddlea.position.x, paddlea.position.y);
  a.setSize(150, 150);

  var b = new Paddle(ctx, "#000", 0);
  b.setPosition(paddleb.position.x, paddleb.position.y);
  b.setSize(150, 150);

  //walls
  //wallleft
  var w1 = new Paddle(ctx, "#000", 0);
  w1.setPosition(walldistance / 2, GAME_HEIGHT / 2);
  w1.setSize(walldistance, GAME_HEIGHT);

  //wall right
  var w2 = new Paddle(ctx, "#000", 0);
  w2.setPosition(GAME_WIDTH - walldistance / 2, GAME_HEIGHT / 2);
  w2.setSize(walldistance, GAME_HEIGHT);

  //wall top
  var w3 = new Paddle(ctx, "#000", 0);
  w3.setPosition(GAME_WIDTH / 2, walldistance / 2);
  w3.setSize(GAME_WIDTH, walldistance);

  //wall bottom
  var w4 = new Paddle(ctx, "#000", 0);
  w4.setPosition(GAME_WIDTH / 2, GAME_HEIGHT - walldistance / 2);
  w4.setSize(GAME_WIDTH, walldistance);
  var numberofmisses = 0;
  var numberOfBounty1 = getRandomInt(0, 6);

  for (var e = 0; e < numberofEnemies && numberofmisses < 2000; e++) {
    var e1 = createNewRandomPaddle(
      e <= numberOfBounty1 ? constants.marker_BOUNTY1 : constants.marker_HOUSE
    );
    if (
      overlaps(e1, enemies) ||
      overlap(e1, a) ||
      overlap(e1, b) ||
      overlap(e1, w1) ||
      overlap(e1, w2) ||
      overlap(e1, w3) ||
      overlap(e1, w4)
    ) {
      numberofmisses++;
      e--;
    } else {
      enemies[e] = e1;
    }
  }
  return enemies;
}

function createNewRandomPaddle(collisionIdentifier) {
  var e1 = new Paddle(ctx, "#000", 0, collisionIdentifier);
  e1.setCollisionIdentifier(collisionIdentifier);
  e1.centerCollide = false;
  e1.setPosition(getRandomInt(0, GAME_WIDTH), getRandomInt(0, GAME_HEIGHT));
  e1.setDirection(getRandomInt(0, 3));
  e1.setSize(getRandomInt(0, GAME_WIDTH / 3), getRandomInt(0, GAME_HEIGHT / 3));
  if (collisionIdentifier == constants.marker_BOUNTY1) {
    e1.roofColor = "RED";
  }

  return e1;
}

function drawEnemies() {
  for (var e = 0; e < enemies.length; e++) {
    drawPaddleCollide(enemies[e]);
  }
}

function initializeEnemyVisuals() {
  for (var e = 0; e < enemies.length; e++) {
    initializeRoof(enemies[e]);
  }
}

function drawEnemyVisuals() {
  for (var e = 0; e < enemies.length; e++) {
    drawHouse(enemies[e]);
  }
}

function overlap(A, B) {
  var ax = A.getDrawX();
  var bx = B.getDrawX();
  var ay = A.getDrawY();
  var by = B.getDrawY();
  var maxAx = ax + A.width;
  var minBx = bx;
  var minAx = ax;
  var maxBx = bx + B.width;
  var minAy = ay;
  var maxBy = by + B.height;
  var maxAy = ay + A.height;
  var minBy = by;

  var distance = 35;

  return (
    maxAx + distance >= minBx &&
    minAx <= maxBx + distance &&
    minAy <= maxBy + distance &&
    maxAy + distance >= minBy
  );
}

function pointIncluded(x, y, B) {
  var ax = x;
  var bx = B.getDrawX();
  var ay = y;
  var by = B.getDrawY();

  var minBx = bx;
  var maxBx = bx + B.width;
  var maxBy = by + B.height;
  var minBy = by;

  return ax >= minBx && ax <= maxBx && ay <= maxBy && ay >= minBy;
}

function overlaps(paddle, paddles) {
  for (var e = 0; e < paddles.length; e++) {
    if (overlap(paddle, paddles[e])) {
      return true;
    }
  }
  return false;
}

function getFont(reduce) {
  var ratio = fontSize / fontBase; // calc ratio
  var size = canvas.width * ratio; // get font size based on current width
  size = size * (reduce == undefined ? 1 : reduce);
  return (size | 0) + "px sans-serif"; // set font
}

function line(x1, y1, x2, y2, linecolor, linewidth) {
  linecolor = typeof linecolor === "undefined" ? "black" : linecolor;
  linewidth = typeof linewidth === "undefined" ? 0.2 : linewidth;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = linecolor;
  ctx.lineWidth = linewidth;
  ctx.stroke();
  ctx.closePath();
}
function extLine(x1, y1, x2, y2, delta) {
  var ox1 = x1 + (x2 - x1) * -delta,
    ox2 = x1 + (x2 - x1) * (1 + delta),
    oy1 = y1 + (y2 - y1) * -delta,
    oy2 = y1 + (y2 - y1) * (1 + delta);
  /*
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(ox2, oy2);
  ctx.stroke();
*/
  return [ox2, oy2];
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function drawPaddleCollide(paddle) {
  for (var w = paddle.getDrawX(); w < paddle.getDrawX() + paddle.width; w++) {
    for (
      var h = paddle.getDrawY();
      h < paddle.getDrawY() + paddle.height;
      h++
    ) {
      if (w > 0 && w < GAME_WIDTH && h > 0 && h < GAME_HEIGHT) {
        collisionState[w][h] = paddle.collisionIdentifier;
        ctx.fillStyle = floorColor;
        ctx.fillRect(w, h, 1, 1);
      }
    }
  }
}

function initializeRoof(paddle) {
  paddle.roof1 = extLine(
    x1,
    y1,
    paddle.getDrawX(),
    paddle.getDrawY(),
    extpercent
  );
  paddle.roof2 = extLine(
    x1,
    y1,
    paddle.getDrawX() + paddle.width,
    paddle.getDrawY(),
    extpercent
  );

  paddle.roof3 = extLine(
    x1,
    y1,
    paddle.getDrawX() + paddle.width,
    paddle.getDrawY() + paddle.height,
    extpercent
  );

  paddle.roof4 = extLine(
    x1,
    y1,
    paddle.getDrawX(),
    paddle.getDrawY() + paddle.height,
    extpercent
  );
}

function drawHouse(paddle) {
  //wall up
  drawQUAD(
    ctx,
    wallColor,
    paddle.getDrawX(),
    paddle.getDrawY(),
    paddle.roof1[0],
    paddle.roof1[1],
    paddle.roof2[0],
    paddle.roof2[1],
    paddle.getDrawX() + paddle.width,
    paddle.getDrawY()
  );
  //wall down
  drawQUAD(
    ctx,
    wallColor,
    paddle.getDrawX(),
    paddle.getDrawY() + paddle.height,

    paddle.roof4[0],
    paddle.roof4[1],
    paddle.roof3[0],
    paddle.roof3[1],
    paddle.getDrawX() + paddle.width,
    paddle.getDrawY() + paddle.height
  );
  //wall1 left
  drawQUAD(
    ctx,
    wallColor,
    paddle.getDrawX(),
    paddle.getDrawY(),
    paddle.roof1[0],
    paddle.roof1[1],
    paddle.roof4[0],
    paddle.roof4[1],
    paddle.getDrawX(),
    paddle.getDrawY() + paddle.height
  );
  //wall right
  drawQUAD(
    ctx,
    wallColor,
    paddle.getDrawX() + paddle.width,
    paddle.getDrawY(),
    paddle.roof2[0],
    paddle.roof2[1],
    paddle.roof3[0],
    paddle.roof3[1],
    paddle.getDrawX() + paddle.width,
    paddle.getDrawY() + paddle.height
  );

  //roof

  drawQUAD(
    ctx,
    paddle.roofColor,
    paddle.roof1[0],
    paddle.roof1[1],
    paddle.roof2[0],
    paddle.roof2[1],
    paddle.roof3[0],
    paddle.roof3[1],
    paddle.roof4[0],
    paddle.roof4[1]
  );

  //rooflines

  line(paddle.roof1[0], paddle.roof1[1], paddle.roof2[0], paddle.roof2[1]);
  line(paddle.roof2[0], paddle.roof2[1], paddle.roof3[0], paddle.roof3[1]);
  line(paddle.roof3[0], paddle.roof3[1], paddle.roof4[0], paddle.roof4[1]);
  line(paddle.roof1[0], paddle.roof1[1], paddle.roof4[0], paddle.roof4[1]);
}

function deleteEnemyAtPosition(x, y) {
  for (var e = 0; e < enemies.length; e++) {
    if (pointIncluded(x, y, enemies[e])) {
      enemies[e].setCollisionIdentifier(constants.marker_NOTHING);
      drawPaddleCollide(enemies[e]);
      enemies[e].roofColor = "green";
      enemies[e].draw();

      return;
    }
  }
}

function setStepOk(paddle) {
  switch (collisionState[paddle.position.x][paddle.position.y]) {
    case constants.marker_NOTHING:
      collisionState[paddle.position.x][paddle.position.y] =
        paddle.collisionIdentifier;
      return true;
    case constants.marker_BOUNTY1:
      collisionState[paddle.position.x][paddle.position.y] =
        paddle.collisionIdentifier;
      paddle.points += 1;
      drawPoints(paddle);
      deleteEnemyAtPosition(paddle.position.x, paddle.position.y);
      return true;
    default:
      return false;
  }
}

function detectCollision(paddle, otherPaddle) {
  //crash on wall
  if (
    paddle.position.x <= 0 ||
    paddle.position.x >= GAME_WIDTH ||
    paddle.position.y <= 0 ||
    paddle.position.y >= GAME_HEIGHT
  ) {
    gameEnds(paddle, otherPaddle);
    return true;
  }
  //console.log("pos x:", paddle.position.x, "pos y:", paddle.position.y);
  if (setStepOk(paddle)) {
    return false;
  } else {
    gameEnds(paddle, otherPaddle);
    return true;
  }
}

function drawQUAD(ctx, color, x1, y1, x2, y2, x3, y3, x4, y4) {
  ctx.beginPath();
  ctx.strokeStyle = wallLineColor;
  ctx.moveTo(x1, y1);
  ctx.stroke();
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.lineTo(x3, y3);
  ctx.stroke();
  ctx.lineTo(x4, y4);
  ctx.stroke();
  ctx.closePath();
  //ctx.lineTo(x1, y1);
  // ctx.stroke();
  ctx.fillStyle = color;
  ctx.fill();
}
function hasTouch() {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
}
function gameEnds(paddle, otherPaddle) {
  if (!hasTouch()) {
    try {
      crash.play();
    } catch (err) {
      console.log(err);
    }
  }

  otherPaddle.points += 3;
  gamestate = 0;
  drawPoints(paddle);
  drawPoints(otherPaddle);
  drawPoints(paddle, true);
  drawPoints(otherPaddle, true);
  var x1 = getRandomInt(0, GAME_WIDTH);
  var y1 = getRandomInt(0, GAME_HEIGHT);
  drawQUAD(
    ctx,
    paddle.color,
    x1,
    y1,
    x1,
    y1 + 50,
    paddle.position.x,
    paddle.position.y
    //0,
    //0
  );
}
function drawPoints(paddle) {
  ctx.font = getFont();
  ctx.fillStyle = paddle.color;

  ctx.fillStyle = paddle.color;
  ctx.fillRect(
    10,
    paddle.startHight - paddle.height * 5,
    paddle.width * 10,
    paddle.height * 7
  );
  ctx.fillStyle = "white";
  ctx.fillText(paddle.points, 10, paddle.startHight + paddle.height);
}
