import { MainScene } from "./scenes/mainScene";

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 300 },
			debug: false
		}
	},
	scene: [MainScene]
};

new Phaser.Game(config);
