"use strict";

function updateSprite(spriteEl, bgPos, altText) {
	spriteEl.style.backgroundPosition = bgPos;
	
	spriteEl.title     = altText;
	spriteEl.ariaLabel = altText;
	spriteEl.role      = "image"; 
}

function createSprite(className) {
	let s = document.createElement("span");
	s.className = className;
	return s;
}
