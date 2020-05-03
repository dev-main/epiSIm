var canvas = document.getElementById("gameScreen");
var ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

function showText(font, message, index, posX, posy) {
  if (index < message.length) {
    setTimeout(function() {
      ctx.font = font;
      ctx.fillText(message[index++], posX, posy + 30 * index);
      showText(font, message, index, posX, posy);
    }, 500);
  }
}

export default class Cover {
  constructor() {}
  draw() {
    showText("30px Arial", "epi sim", 0, 20, 20);
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    var line = 20;
    var lineDistance = 30;
    ctx.font = "20px Arial";
    if (this.hasTouch()) {
      ctx.fillText("Touch control:", canvas.width / 2, (line += lineDistance));
      ctx.fillText(
        "left or right area of your side to steer",
        canvas.width / 2,
        (line += 50)
      );
      ctx.fillText(
        "(touch middle area of screen to start)",
        30,
        ctx.canvas.height - 30
      );
    } else {
      ctx.fillText(
        "Keyboard control:",
        canvas.width / 2,
        (line += lineDistance)
      );
      ctx.fillStyle = "red";
      ctx.fillText("RED [<-Y] [X->]", canvas.width / 2, (line += lineDistance));
      ctx.fillStyle = "blue";
      ctx.fillText("BLUE [<-N][M->]", canvas.width / 2, (line += lineDistance));
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textAlign = "left";
      ctx.fillText("(press any key to start)", 30, ctx.canvas.height - 30);
    }
  }
  hasTouch() {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch (e) {
      return false;
    }
  }
}
