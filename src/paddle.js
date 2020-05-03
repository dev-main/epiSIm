var constants = require("./constants");
export default class Paddle {
  constructor(ctx, color, startHight) {
    //collisionidentifier 0 nothng 1-5 players 1 red 2 blue, 6 house 7 bounty
    this.centerCollide = true;
    this.context = ctx;
    this.startHight = startHight;
    this.direction = 0;
    this.stepsize = 1;
    this.width = 10;
    this.height = 10;
    this.color = color;
    this.points = 0;
    this.collisionIdentifier = constants.marker_NOTHING;
    this.roofColor = "white";

    this.roof1;
    this.roof2;
    this.roof3;
    this.roof4;

    this.position = {
      x: 0,
      y: 0
    };
  }
  setCollisionIdentifier(ci) {
    this.collisionIdentifier = ci;
  }
  step() {
    //console.log("step", this.direction);
    switch (this.direction) {
      case 0:
        this.position.y -= this.stepsize;
        //console.log("position y", this.position.y);
        break;
      case 1:
        this.position.x += this.stepsize;
        // console.log("position x", this.position.x);
        break;
      case 2:
        this.position.y += this.stepsize;
        //console.log("position y", this.position.y);
        break;
      case 3:
        this.position.x -= this.stepsize;
        //console.log("position x", this.position.x);
        break;
      default:
        console.log("error default direction", this.direction);
        break;
    }
  }
  mod(n, m) {
    return ((n % m) + m) % m;
  }

  setDirection(theDirection) {
    this.direction = this.mod(theDirection, 4);
  }

  setPosition(x, y) {
    this.position.x = Math.floor(x);
    this.position.y = Math.floor(y);
  }

  setSize(width, height) {
    this.width = Math.floor(width);
    this.height = Math.floor(height);
  }

  draw() {
    this.context.fillStyle = this.color;
    this.context.fillRect(
      this.getDrawX(),
      this.getDrawY(),
      this.width,
      this.height
    );
  }

  getDrawX() {
    return this.position.x - Math.floor(this.width / 2);
  }
  getDrawY() {
    return this.position.y - Math.floor(this.height / 2);
  }
}
