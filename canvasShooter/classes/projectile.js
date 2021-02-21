class Projectile {
  radius = projectilesOptions.size || 10;
  color = projectilesOptions.color || "white";
  speed = projectilesOptions.speed || 6;
  img = images.projectile || false;

  constructor(startX, startY, targetX, targetY) {
    this.x = startX;
    this.y = startY;
    this.angle = getAngleBetweenPoints(this.x, this.y, targetX, targetY);
    this.velocity = getVelocityByAngle(this.angle, this.speed);
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  offScreen() {
    return (
      this.x - this.radius > canvas.width ||
      this.x + this.radius < 0 ||
      this.y - this.radius > canvas.height ||
      this.y + this.radius < 0
    );
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
