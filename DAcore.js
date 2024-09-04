"use strict";

// Worst case example: NADIA / URSARING-MACHAMP-SALAMENCE => 412 valid teams
// actually very easy in terms of computation time and memory use
/*
	trainerName:       trainer name string
	teamSpeciesNames:  array of 3 pokemon species name strings
	
	battleStyle:     string from battleStyles[i], or falsey to ignore
	evStyle:         EvStyle() object, or falsey to ignore
	teamMoveNames:   array of any length of move name strings that can belong to any poke on the team, or falsey to ignore
	
	speciesMoveNames:  object with keys of species name strings and values of array of move name strings, or falsey to ignore
		example:
			{ "Gengar"   : [ "Thunderbolt", "Sludge Bomb" ],
			  "Swampert" : [ "Surf",        "Earthquake"  ]  }
	
	speciesItemNames:  object with keys of species name strings and values of item name strings, or falsey to ignore
		example:
			{ "Gengar"   : "BrightPowder",
			  "Swampert" : "Soft Sand"     }
*/
function possibleTeamSearch(level, trainerName, teamSpeciesNames, battleStyle, evStyle, teamMoveNames, speciesMoveNames, speciesItemNames) {
	let possibleTeams = [];
	
	// Make a list of all specific pokemon that match the species
	// eg provided [Gengar, Weezing, Nidoking] create =>
	// [ [ Gengar 1,   Gengar 2,  Gengar 3 ],
	//   [ Weezing 1,  Weezing 3           ],
	//   [ Nidoking 2, Nidoking 3          ] ]
	
	let speciesLists = [ [], [], [] ];
	let trainer = trainers[trainerName];
	if (!trainer) {
		return possibleTeams;
	}
	
	// Doing this in one iteration of the roster to be most efficient
	for (let r = 0; r < trainer.roster.length; r++) {
		let poke = trainer.roster[r];
		// Ignoring high index pokes if not open level
		if ((level === 50) && poke.index >= 850) {
			continue;
		}
		
		// Check if this matches any of the 3 target species
		for (let s = 0; s < 3; s++) {
			if (poke.species.name === teamSpeciesNames[s]) {
				speciesLists[s].push(poke);
				break;
			}
		}
	}
	
	// Reject if one or more species was not found
	if (speciesLists.some(list => list.length === 0)) {
		return possibleTeams;
	}
	
	// Filter utility functions
	function checkSpeciesItem(poke, speciesItemNames) {
		if (Object.hasOwn(speciesItemNames, poke.species.name)) {
			return poke.item === speciesItemNames[poke.species.name];
		}
		
		return true;
	}
	
	function checkSpeciesMoves(poke, speciesMoveNames) {
		if (Object.hasOwn(speciesMoveNames, poke.species.name)) {
			let targetMoveList = speciesMoveNames[poke.species.name];
			let pokeMoveList = poke.moves.map(move => move.name);
			
			for (let m = 0; m < targetMoveList.length; m++) {
				if (!pokeMoveList.includes(targetMoveList[m])) {
					return false;
				}
			}
		}
		
		return true;
	}
	
	// Next, use the speciesLists to build teams, filtering with known parameters + item clause
	for (let i = 0; i < speciesLists[0].length; i++) {
		let poke1 = speciesLists[0][i];
		
		// Species-specific filters done directly after selecting a pokemon from the species list
		
		// Known items
		if (speciesItemNames && !checkSpeciesItem(poke1, speciesItemNames)) {
			continue;
		}
		
		// Known moves
		if (speciesMoveNames && !checkSpeciesMoves(poke1, speciesMoveNames)) {
			continue;
		}
		
		for (let j = 0; j < speciesLists[1].length; j++) {
			let poke2 = speciesLists[1][j];
			
			// Item clause
			if (poke1.item === poke2.item) {
				continue;
			}
			
			// Known items
			if (speciesItemNames && !checkSpeciesItem(poke2, speciesItemNames)) {
				continue;
			}
			
			// Known moves
			if (speciesMoveNames && !checkSpeciesMoves(poke2, speciesMoveNames)) {
				continue;
			}
			
			for (let k = 0; k < speciesLists[2].length; k++) {
				let poke3 = speciesLists[2][k];
				
				// Item clause
				if (poke1.item === poke3.item || poke2.item === poke3.item) {
					continue;
				}
				
				// Known items
				if (speciesItemNames && !checkSpeciesItem(poke3, speciesItemNames)) {
					continue;
				}
				
				// Known moves
				if (speciesMoveNames && !checkSpeciesMoves(poke3, speciesMoveNames)) {
					continue;
				}
				
				
				// Now whole-team filtering
				
				let team = new TrainerTeam(trainer, poke1, poke2, poke3);
				
				// Filters sorted by speed, quickest filters checked first before falling back to slower ones
				if (teamMoveNames && !team.hasMoves(teamMoveNames)) {
					continue;
				}
				
				if (evStyle && !team.evStyle().isEqual(evStyle)) {
					continue;
				}
				
				if (battleStyle && battleStyle !== team.battleStyle()) {
					continue;
				}
				
				// Filters passed, add possibility
				possibleTeams.push(team);
			}
		}
	}
	
	return possibleTeams;
}


function calculateInstanceProbabilities(possibleTeams, opponentPokesSpeciesInOrder, playerPokeSpeciesNames) {
	let ret = {};
	
	let probabilityTotal = 0;
	
	let perceivedPlayerTeam = playerPokeSpeciesNames.concat("Ditto");
	
	for (let t = 0; t < possibleTeams.length; t++) {
		let team = possibleTeams[t];
		
		let speciesNames = team.pokes.map(bfpoke => bfpoke.species.name);
		let instances    = team.pokes.map(bfpoke => bfpoke.name);
		
		let possiblePicks = team.possiblePicks_wrong(perceivedPlayerTeam);
		
		for (let p = 0; p < possiblePicks.length; p++) {
			let pick = possiblePicks[p];
			
			// Skip this entry if it has a probability of 0
			if (pick.probability === 0) {
				continue;
			}
			
			let appearedSpecies   = pick.pokeIdx.map(i => speciesNames[i]);
			let skipPickFlag = false;
			for (let o = 0; o < opponentPokesSpeciesInOrder.length; o++) {
				if (!(appearedSpecies[o] === opponentPokesSpeciesInOrder[o])) {
					skipPickFlag = true;
					break;
				}
			}
			
			if (skipPickFlag) {
				continue;
			}
			
			// Add the instances here into the tally
			let appearedInstances = pick.pokeIdx.map(i => instances[i]);
			for (let i = 0; i < appearedInstances.length; i++) {
				let name    = appearedInstances[i];
				let species = appearedSpecies[i];
				
				// Add blank entry if not already added
				if (!Object.hasOwn(ret, species)) {
					ret[species] = {
						total : {
							appear : 0,
							lead : 0
						},
						
						instances : {}
					};
				}
				
				if (!Object.hasOwn(ret[species].instances, name)) {
					ret[species].instances[name] = {
						appear : 0,
						lead : 0
					};
				}
				
				// Note this assumes team T of possibleTeams is uniformly random, and normalizes later
				// Else would have to account for the weight of the team before adding its pick probability
				ret[species].instances[name].appear += pick.probability;
				
				if (i === 0) {
					ret[species].instances[name].lead += pick.probability;
				}
			}
			
			probabilityTotal += pick.probability;
		}
	}
	
	// Normalize and sum total
	let speciesKeys = Object.keys(ret);
	for (let s = 0; s < speciesKeys.length; s++) {
		let speciesName = speciesKeys[s];
		
		let instanceKeys = Object.keys(ret[speciesName].instances);
		for (let i = 0; i < instanceKeys.length; i++) {
			let instanceName = instanceKeys[i];
			
			ret[speciesName].instances[instanceName].appear /= probabilityTotal;
			ret[speciesName].instances[instanceName].lead   /= probabilityTotal;
			
			ret[speciesName].total.appear += ret[speciesName].instances[instanceName].appear;
			ret[speciesName].total.lead   += ret[speciesName].instances[instanceName].lead;
		}
	}
	
	return ret;
}
