"use strict";

function pokeIconLinkedSpriteUpdate() {
	let spriteElIds = this.dataset.daLinkedSprite.split(" ");
	
	spriteElIds.forEach(spriteId => {
		let spriteEl = document.getElementById(spriteId);
		setPokeIconSprite(spriteEl, this.value);
	});
}

function setPokeIconSprite(spriteEl, pokeName) {
	let num;
	if (Object.hasOwn(pokemon, pokeName)) {
		num = pokemon[pokeName].number;
	} else {
		updateSprite(spriteEl, "", "Unknown Pokémon");
		return;
	}
	
	const spritesPerRow = 16;
	const spriteDimX = 32;
	const spriteDimY = 32;
	
	let xPos = -1 * spriteDimX * (num % spritesPerRow);
	let yPos = -1 * spriteDimY * Math.floor(num / spritesPerRow);
	
	let bgPos = `${xPos}px ${yPos}px`;
	
	updateSprite(spriteEl, bgPos, pokeName);
}