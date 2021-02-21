class Player {
  x = playerOptions.x || canvas.width / 2;
  y = playerOptions.y || canvas.height / 2;
  radius = playerOptions.radius || 30;
  color = playerOptions.color || "white";
  angle = playerOptions.angle || 0;
  img = images.player || false;

  constructor() {}

  updateAngle(targetX, targetY) {
    this.angle = getAngleBetweenPoints(this.x, this.y, targetX, targetY);
  }

  draw() {
    ctx.save();
    // translate to center of object
    ctx.translate(this.x, this.y);

    if (this.img) {
      //if image was selected
      ctx.rotate(this.angle);
      ctx.drawImage(
        this.img,
        0 - this.radius,
        0 - this.radius,
        this.radius * 2,
        this.radius * 2
      );
    } else {
      //if only color was selected
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.restore();
  }
}
