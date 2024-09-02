"use strict";

/* Test str

Espeon @ Lum Berry
Ability: Synchronize
Level: 24
Shiny: Yes
Happiness: 128
EVs: 252 SpA / 4 SpD / 252 Spe
IVs: 30 SpA / 30 SpD
Timid Nature
- Substitute
- Psychic
- Hidden Power Ground
- Shadow Ball

*/

// Note this does not do validation; all this does is take a string and sort it into the relevant fields for validation later
// Any invalid fields that could not be matched will be left as nulls
function pokeStrImportSet(pokeStr) {
	pokeStr = String(pokeStr);
	
	pokeStr = pokeStr.replaceAll("\r\n", "\n");
	pokeStr = pokeStr.split("\n");
	pokeStr = pokeStr.filter(line => line !== "");
	pokeStr = pokeStr.map(line => line.trim());
	
	let pokeSet = {
		species: null,
		item: "No item",
		ability: null,
		nature: null,
		evs: {
			hp:  0,
			atk: 0,
			def: 0,
			spa: 0,
			spd: 0,
			spe: 0
		},
		
		ivs: {
			hp:  31,
			atk: 31,
			def: 31,
			spa: 31,
			spd: 31,
			spe: 31
		},
		
		moves: []
	};
	
	for (let i = 0; i < pokeStr.length; i++) {
		let line = pokeStr[i];
		
		let tokens = line.split(/\s{1,}/);
		if (tokens.length === 0) {
			continue;
		}
		
		// First line contains species, held item, sometimes nickname, sometimes gender
		if (i === 0) {
			// Strip away gender if applicable
			const maleTokens   = [ "M", "(M)", "\u2642", "(\u2642)" ];
			const femaleTokens = [ "F", "(F)", "\u2640", "(\u2640)" ];
			
			for (let i = 0; i < maleTokens.length; i++) {
				let index = tokens.indexOf(maleTokens[i]);
				if (index !== -1) {
					tokens.splice(index, 1);
				}
			}
			
			for (let i = 0; i < femaleTokens.length; i++) {
				let index = tokens.indexOf(femaleTokens[i]);
				if (index !== -1) {
					tokens.splice(index, 1);
				}
			}
			
			// Strip off nickname if in (Species) @ (Helditem) ** (Nickname) notation
			let nnIndex = tokens.indexOf("**");
			if (nnIndex !== -1) {
				tokens = tokens.slice(0, nnIndex);
			}
			
			// Can extract held item now
			let atIndex = tokens.indexOf("@");
			if (atIndex !== -1) {
				let itemName = tokens.slice(atIndex + 1).join(" ");
				if (items.includes(itemName)) {
					pokeSet.item = itemName;
				}/* else {
					throw `Invalid item: ${itemName}`;
				}*/
				
				tokens = tokens.slice(0, atIndex);
			}
			
			// Lastly must get species name, worst part
			if (tokens.length === 1) {
				if (Object.hasOwn(pokemon, tokens[0])) {
					pokeSet.species = tokens[0];
				}/* else {
					throw `Invalid species: ${tokens[0]}`;
				}*/
			} else {
				// Check for Mr. Mime, the only pokemon with a space in the name
				let pokeName = tokens.join(" ");
				if (Object.hasOwn(pokemon, pokeName)) {
					pokeSet.species = pokeName;
				} else {
					// Check if species name is inside parens
					let str = pokeName;
					let parenStart = str.indexOf("(");
					let parenEnd   = str.indexOf(")");
					
					if (parenStart !== -1 && parenEnd !== -1 && parenStart < parenEnd) {
						let parenToken    = str.slice(parenStart+1, parenEnd).trim();
						//let nonParenToken = str.slice(parenEnd+1).trim();
						
						if (Object.hasOwn(pokemon, parenToken)) {
							pokeSet.species = parenToken;
						}/* else {
							throw `Could not parse species: ${str}`;
						}*/
					}
				}
			}
			
			continue;
		}
		
		// Process any line but first
		let caseTokens = tokens.map(token => token.toLocaleLowerCase());
		
		// Don't actually care about shininess or happiness in this application, not bothering to parse them
		if (caseTokens[0] === "happiness:" || caseTokens[0] === "shiny:") {
			continue;
		}
		
		// TODO: level?
		if (caseTokens[0] === "level:") {
			continue;
		}
		
		// Handle ability
		if (caseTokens[0] === "ability:" && tokens.length > 1) {
			pokeSet.ability = tokens.slice(1).join(" ");
			continue;
		}
		
		// Nature: XXXX
		if (caseTokens[0] === "nature:" && tokens.length > 1 && Object.hasOwn(natures, tokens[1])) {
			pokeSet.nature = tokens[1];
		}
		
		// XXXX Nature
		if (tokens.length > 1 && caseTokens[1] === "nature" && Object.hasOwn(natures, tokens[0])) {
			pokeSet.nature = tokens[0];
		}
		
		// EVs and IVs
		if (caseTokens[0] === "evs:" || caseTokens[0] === "ivs:" && tokens.length > 1) {
			let scope;
			if (caseTokens[0] === "evs:") {
				scope = pokeSet.evs;
			} else {
				scope = pokeSet.ivs;
			}
			
			// Acceptable words for each stat (after case coercion)
			const statMap = {
				"hp"              : "hp",
				
				"atk"             : "atk",
				"attack"          : "atk",
				
				"def"             : "def",
				"defense"         : "def",
				
				"spa"             : "spa",
				"satk"            : "spa",
				"spatk"           : "spa",
				"sp. attack"      : "spa",
				"sattack"         : "spa",
				"spattack"        : "spa",
				"special attack"  : "spa",
				
				"spd"             : "spd",
				"sdef"            : "spd",
				"spdef"           : "spd",
				"sp. defense"     : "spd",
				"spdefense"       : "spd",
				"sdefense"        : "spd",
				"special defense" : "spd",
				
				"spe"             : "spe",
				"speed"           : "spe"
			};
			
			// Rejoin token string, skipping start, and re-split by slashes
			caseTokens = caseTokens.slice(1).join(" ").split("/");
			
			// Split again into 2D array like [ [ 252, "Atk" ], [ 24, "Def" ], ... ]
			caseTokens = caseTokens.map(token => {
				let tmp = token.trim().split(" ");
				if (tmp.length === 1) {
					return null;
				}
				
				return [ parseInt(tmp[0]), tmp.slice(1).join(" ") ];
			});
			
			for (let t = 0; t < caseTokens.length; t++) {
				if (caseTokens[t] === null || isNaN(caseTokens[t][0])) {
					// Skip malformed stat
					continue;
				}
				
				let val  = caseTokens[t][0];
				let stat = caseTokens[t][1];
				
				if (Object.hasOwn(statMap, stat)) {
					let statName = statMap[stat];
					scope[statName] = val;
				}
			}
			
			continue;
		}
		
		// Moves
		if (caseTokens[0][0] === "-") {
			let moveStr = tokens.join(" ");
			
			// Remove dash, trim whitespace
			moveStr = moveStr.slice(1).trim();
			
			// Special case for hidden power
			if (moveStr.startsWith("Hidden Power")) {
				moveStr = "Hidden Power";
			}
			
			// Else must match move name exactly
			if (Object.hasOwn(moves, moveStr)) {
				pokeSet.moves.push(moveStr);
			}
			
			continue;
		}
	}
	
	return pokeSet;
}