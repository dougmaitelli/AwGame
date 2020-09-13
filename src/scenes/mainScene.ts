import "phaser";

import skyPng from "../assets/sky.png";
import groundPng from "../assets/platform.png";
import starPng from "../assets/star.png";
import bombPng from "../assets/bomb.png";
import characterJson from "../assets/character.json";

export class MainScene extends Phaser.Scene {
	private platforms: Phaser.Physics.Arcade.StaticGroup;
	private player: Phaser.Physics.Arcade.Sprite;
	private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	private stars: Phaser.Physics.Arcade.Group;
	private bombs: Phaser.Physics.Arcade.Group;
	private score: number = 0;
	private scoreText: Phaser.GameObjects.Text;

	constructor() {
		super({ key: "MainScene" });
	}

	public preload(): void {
		this.load.image("sky", skyPng);
		this.load.image("ground", groundPng);
		this.load.image("star", starPng);
		this.load.image("bomb", bombPng);
		this.load.multiatlas("character", characterJson);
	}

	public create(): void {
		this.add.image(400, 300, "sky");

		this.platforms = this.physics.add.staticGroup();

		(this.platforms.create(400, 568, "ground") as Phaser.Physics.Arcade.Image)
			.setScale(2)
			.refreshBody();

		this.platforms.create(600, 400, "ground");
		this.platforms.create(50, 250, "ground");
		this.platforms.create(750, 220, "ground");

		this.player = this.physics.add.sprite(100, 450, "character", "idle/i1.png");
		this.player.setScale(0.2).refreshBody();

		this.player.setBounce(0.1);
		this.player.setCollideWorldBounds(true);

		this.anims.create({
			key: "idle",
			frames: this.anims.generateFrameNames("character", {
				start: 1,
				end: 2,
				prefix: "idle/i",
				suffix: ".png"
			}),
			frameRate: 10
		});

		this.anims.create({
			key: "running",
			frames: this.anims.generateFrameNames("character", {
				start: 1,
				end: 8,
				prefix: "run/k",
				suffix: ".png"
			}),
			frameRate: 10,
			repeat: -1
		});

		this.physics.add.collider(this.player, this.platforms);

		this.cursors = this.input.keyboard.createCursorKeys();

		this.stars = this.physics.add.group({
			key: "star",
			repeat: 11,
			setXY: { x: 12, y: 0, stepX: 70 }
		});

		this.stars.children.iterate((child: Phaser.Physics.Arcade.Sprite) => {
			child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
		});

		this.physics.add.collider(this.stars, this.platforms);

		this.physics.add.overlap(
			this.player,
			this.stars,
			(
				player: Phaser.Physics.Arcade.Sprite,
				star: Phaser.Physics.Arcade.Image
			) => {
				this.collectStar(player, star);
			},
			null,
			this
		);

		this.scoreText = this.add.text(16, 16, "score: 0", {
			fontSize: "32px",
			fill: "#000"
		});

		this.bombs = this.physics.add.group();

		this.physics.add.collider(this.bombs, this.platforms);

		this.physics.add.collider(
			this.player,
			this.bombs,
			(
				player: Phaser.Physics.Arcade.Sprite,
				bomb: Phaser.Physics.Arcade.Image
			) => {
				this.hitBomb(player, bomb);
			},
			null,
			this
		);
	}

	public update(): void {
		if (this.cursors.left.isDown) {
			this.player.setVelocityX(-160);

			this.player.anims.play("running", true);
			this.player.scaleX = -Math.abs(this.player.scaleX);
		} else if (this.cursors.right.isDown) {
			this.player.setVelocityX(160);

			this.player.anims.play("running", true);
			this.player.scaleX = Math.abs(this.player.scaleX);
		} else {
			this.player.setVelocityX(0);

			this.player.anims.play("idle");
			this.player.scaleX = Math.abs(this.player.scaleX);
		}

		if (this.cursors.up.isDown && this.player.body.touching.down) {
			this.player.setVelocityY(-330);
		}
	}

	public hitBomb(
		player: Phaser.Physics.Arcade.Sprite,
		bomb: Phaser.Physics.Arcade.Image
	): void {
		bomb.disableBody(true, true);

		this.physics.pause();

		player.setTint(0xff0000);

		player.anims.play("turn");

		//gameOver = true;
	}

	public collectStar(
		_player: Phaser.Physics.Arcade.Sprite,
		star: Phaser.Physics.Arcade.Image
	): void {
		star.disableBody(true, true);

		this.score += 10;
		this.scoreText.setText(`Score: ${this.score}`);

		if (this.stars.countActive(true) === 0) {
			this.stars.children.iterate((child: Phaser.Physics.Arcade.Image) => {
				child.enableBody(true, child.x, 0, true, true);
			});

			const x =
				this.player.x < 400
					? Phaser.Math.Between(400, 800)
					: Phaser.Math.Between(0, 400);

			const bomb = this.bombs.create(
				x,
				16,
				"bomb"
			) as Phaser.Physics.Arcade.Image;
			bomb.setBounce(1);
			bomb.setCollideWorldBounds(true);
			bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
		}
	}
}
