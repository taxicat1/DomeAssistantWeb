"use strict";

function formBoilerPlate() {
	let formEls = document.querySelectorAll("[data-da-type], [data-da-linked-text], [data-da-linked-clear], [data-da-save-local-storage]");
	
	function caseInsensitiveStringSort(a, b) {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	}
	
	// Polyfill Array.prototype.toSorted, not widely supported enough
	function toSorted(arr, sortFn) {
		if (Array.prototype.toSorted) {
			return arr.toSorted(sortFn);
		}
		
		let newArr = new Array(arr.length);
		for (let i = 0; i < newArr.length; i++) {
			newArr[i] = arr[i];
		}
		
		newArr.sort(sortFn);
		return newArr;
	}
		
	
	// Pre-gather these
	let pokeNames_sorted    = Object.keys(pokemon ).sort(caseInsensitiveStringSort);
	let moveNames_sorted    = Object.keys(moves   ).sort(caseInsensitiveStringSort);
	let natureNames_sorted  = Object.keys(natures ).sort(caseInsensitiveStringSort);
	let trainerNames_sorted = Object.keys(trainers).sort(caseInsensitiveStringSort);
	
	let battleStyles_sorted = toSorted(battleStyles, caseInsensitiveStringSort);
	let itemNames_sorted    = toSorted(items,        caseInsensitiveStringSort);
	let abilityNames_sorted = toSorted(abilities,    caseInsensitiveStringSort);
	
	let statNames = [
		// Presentation name, value name
		[ "HP",              "hp"  ],
		[ "Attack",          "atk" ],
		[ "Defense",         "def" ],
		[ "Special Attack",  "spa" ],
		[ "Special Defense", "spd" ],
		[ "Speed",           "spe" ]
	];
	
	let dataPlaceholderText = {
		"pokemon"     : "Pokémon",
		"battlestyle" : "Battle style text",
		"trainer"     : "Trainer name",
		"stat"        : "Stat",
		"move"        : "Move",
		"item"        : "Held item",
		"nature"      : "Nature",
		"ability"     : "Ability"
	};
	
	
	for (let el of formEls) {
		if (el.tagName.toLowerCase() === "select") {
			switch (el.dataset.daType) {
				case "pokemon":
					for (let i = 0; i < pokeNames_sorted.length; i++) {
						let pokeName = pokeNames_sorted[i];
						el.append(makeOptionEl(pokeName));
					}
					
					if (el.dataset.daLinkedSprite) {
						el.addEventListener("change", pokeIconLinkedSpriteUpdate);
					}
					
					break;
				
				case "battlestyle":
					for (let i = 0; i < battleStyles_sorted.length; i++) {
						el.append(makeOptionEl(battleStyles_sorted[i]));
					}
					
					break;
				
				case "trainer":
					for (let i = 0; i < trainerNames_sorted.length; i++) {
						let trainerName = trainerNames_sorted[i];
						let displayName = trainers[trainerName].displayName;
						el.append(makeOptionEl(trainerName, displayName));
					}
					
					break;
				
				case "stat":
					for (let i = 0; i < statNames.length; i++) {
						let displayName = statNames[i][0];
						let valName = statNames[i][1];
						
						el.append(makeOptionEl(valName, displayName));
					}
					
					break;
				
				case "nature":
					for (let i = 0; i < natureNames_sorted.length; i++) {
						let natureName = natureNames_sorted[i];
						el.append(makeOptionEl(natureName));
					}
					
					break;
				
				case "ability":
					for (let i = 0; i < abilityNames_sorted.length; i++) {
						let abilityName = abilityNames_sorted[i];
						el.append(makeOptionEl(abilityName));
					}
					
					break;
				
				case "move":
					for (let i = 0; i < moveNames_sorted.length; i++) {
						let moveName = moveNames_sorted[i];
						el.append(makeOptionEl(moveName));
					}
					
					break;
				
				case "item":
					for (let i = 0; i < itemNames_sorted.length; i++) {
						let itemName = itemNames_sorted[i];
						el.append(makeOptionEl(itemName));
					}
					
					if (el.dataset.daLinkedSprite) {
						el.addEventListener("change", heldItemLinkedSpriteUpdate);
					}
					
					break;
			}
			
			
			if (el.dataset.daLinkedText) {
				let textEl = document.getElementById(el.dataset.daLinkedText);
				bindTextToSelect(el, textEl);
				
				if (Object.hasOwn(dataPlaceholderText, el.dataset.daType)) {
					textEl.placeholder = dataPlaceholderText[el.dataset.daType];
				}
				
				el.selectedIndex = -1;
			}
			
			
			if (el.dataset.daLinkedClear) {
				let clearEl = document.getElementById(el.dataset.daLinkedClear);
				clearEl.addEventListener("click", () => clearFormEl(el));
			}
		}
		
		if (el.dataset.daSaveLocalStorage) {
			loadLocalStorage(el);
			el.addEventListener("change", () => saveLocalStorage(el));
		}
	}
}
