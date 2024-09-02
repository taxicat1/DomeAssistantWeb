"use strict";

function heldItemLinkedSpriteUpdate() {
	let spriteElIds = this.dataset.daLinkedSprite.split(" ");
	
	spriteElIds.forEach(spriteId => {
		let spriteEl = document.getElementById(spriteId);
		setHeldItemSprite(spriteEl, this.value);
	});
}

function setHeldItemSprite(spriteEl, itemName) {
	let num = items.indexOf(itemName);
	if (num === -1) {
		updateSprite(spriteEl, "", "Unknown item");
		return;
	}
	
	const spritesPerRow = 16;
	const spriteDimX = 24;
	const spriteDimY = 24;
	
	let xPos = -1 * spriteDimX * (num % spritesPerRow);
	let yPos = -1 * spriteDimY * Math.floor(num / spritesPerRow);
	
	let bgPos = `${xPos}px ${yPos}px`;
	
	updateSprite(spriteEl, bgPos, itemName);
}