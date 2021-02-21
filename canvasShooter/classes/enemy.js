class Enemy {
  sizeRange = enemiesOptions.sizeRange || [10, 40];
  decrease = enemiesOptions.decrease || 15;
  speed = enemiesOptions.speed || 1;
  hitPoints = enemiesOptions.hitPoints || 100;
  destroyPoints = enemiesOptions.destroyPoints || 250;
  img = this.getRandomImg(images.enemies) || false;
  distroyed = false;

  constructor() {
    this.radius = getRandomSizeBetween(...this.sizeRange);
    this.x, this.y;
    if (Math.random() < 0.5) {
      this.x =
        Math.random() < 0.5 ? 0 - this.radius : canvas.width + this.radius;
      this.y = Math.random() * canvas.height;
    } else {
      this.x = Math.random() * canvas.width;
      this.y =
        Math.random() < 0.5 ? 0 - this.radius : canvas.height + this.radius;
    }

    this.color = getRandomColor();
    this.angle = getAngleBetweenPoints(this.x, this.y, player.x, player.y);
    this.velocity = getVelocityByAngle(this.angle, this.speed);
  }

  getRandomImg(imgs) {
    let names = Object.keys(imgs);
    let randomName = names[Math.floor(Math.random() * names.length)];
    return imgs[randomName];
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.checkHit();
  }
  checkHit() {
    projectiles.forEach((projectile, index) => {
      if (checkCollision(this, projectile)) {
        this.createParticles();
        removeFromArray(projectiles, index);
        this.radius -= this.decrease;
        // gsap.to(this, { radius: this.radius - this.decrease });
        if (this.radius < 0) this.radius = 0;
        updateScore(this.hitPoints);
      }
    });
    if (this.radius < this.sizeRange[0]) {
      this.destroyed = true;
      updateScore(this.destroyPoints);
    }
  }

  createParticles() {
    for (let i = 0; i < this.radius * 2; i++) {
      particles.push(
        new Particle(this.x, this.y, Math.random() * 2, this.color, {
          x: (Math.random() - 0.5) * (Math.random() * 6),
          y: (Math.random() - 0.5) * (Math.random() * 6),
        })
      );
    }
  }

  draw() {
    ctx.save();

    // translate to center of object
    ctx.translate(this.x, this.y);

    if (this.img) {
      //if image was selected
      // ctx.rotate(this.angle);
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
