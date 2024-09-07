"use strict";

function calcDamageRange(atkLevel, atkPower, atkStat, defStat, stab, typeMultiplier) {
	let baseDmg = ((((Math.floor((atkLevel<<1)/5) + 2) * atkPower * atkStat)/(25*defStat))>>>1)+2;
	let critDmg = baseDmg<<1;
	
	// Must do in this order: Crit, STAB, Type1, Type2, random
	// Because crit randomly forks the damage path early on, we just return two ranges
	
	baseDmg = Math.floor(baseDmg*stab);
	critDmg = Math.floor(critDmg*stab);
	
	baseDmg = Math.floor(baseDmg*typeMultiplier);
	critDmg = Math.floor(critDmg*typeMultiplier);
	
	let hpRangeBase = [];
	let hpRangeCrit = [];
	
	for (let r = 85; r <= 100; r++) {
		let baseDmgRoll = Math.floor((baseDmg * r) / 100);
		let critDmgRoll = Math.floor((critDmg * r) / 100);
		
		if (baseDmgRoll === 0) {
			baseDmgRoll = 1;
		}
		
		if (critDmgRoll === 0) {
			critDmgRoll = 1;
		}
		
		hpRangeBase.push(baseDmgRoll);
		hpRangeCrit.push(critDmgRoll);
	}
	
	return {
		base : hpRangeBase,
		crit : hpRangeCrit
	};
}

function quickCalcHp(level, baseStat, ev, iv) {
	if (baseStat === 1) {
		return 1; // Shedinja
	}
	
	return Math.floor((((2 * baseStat) + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}

function quickCalcStat(level, natureModifer, baseStat, ev, iv) {
	return Math.floor((Math.floor((((2 * baseStat) + iv + Math.floor(ev / 4)) * level) / 100) + 5) * natureModifer);
}

function typeMultiplierVsPoke(attack, defenderPoke) {
	let multiplier = 1;
	multiplier *= attack.type.multipliers.offensive[defenderPoke.species.type1.name];
	if (defenderPoke.species.type2 !== null) {
		multiplier *= attack.type.multipliers.offensive[defenderPoke.species.type2.name];
	}
	
	return multiplier;
}

// Returns true if the defender is ability-immune to the attack, false otherwise
function abilityImmunityVsPoke(attack, defenderPoke) {
	switch (defenderPoke.ability) {
		case "Levitate":
			return attack.type.name === "Ground";
		
		case "Flash Fire":
			return attack.type.name === "Fire";
		
		case "Volt Absorb":
			return attack.type.name === "Electric";
		
		case "Water Absorb":
			return attack.type.name === "Water";
		
		case "Wonder Guard":
			// In Gen III, typeless moves like Future Sight can hit through Wonder Guard
			return !moveHasFlag(attack.name, "ignoresType") && typeMultiplierVsPoke(attack, defenderPoke) <= 1;
		
		case "Soundproof":
			return moveHasFlag(attack.name, "soundBased");
		
		case "Sturdy":
			return moveHasFlag(attack.name, "ohko");
		
		case "Damp":
			return moveHasFlag(attack.name, "selfDestruction");
		
		default:
			return false;
	}
}

function calcPokeSetStats(pokeSet) {
	pokeSet.stats = {};
	
	pokeSet.stats.hp = quickCalcHp(
		pokeSet.level,
		pokeSet.species.baseStats.hp,
		pokeSet.evs.hp,
		pokeSet.ivs.hp
	);
	
	pokeSet.stats.atk = quickCalcStat(
		pokeSet.level,
		pokeSet.nature.multipliers.atk,
		pokeSet.species.baseStats.atk,
		pokeSet.evs.atk,
		pokeSet.ivs.atk
	);
	
	pokeSet.stats.def = quickCalcStat(
		pokeSet.level,
		pokeSet.nature.multipliers.def,
		pokeSet.species.baseStats.def,
		pokeSet.evs.def,
		pokeSet.ivs.def
	);
	
	pokeSet.stats.spa = quickCalcStat(
		pokeSet.level,
		pokeSet.nature.multipliers.spa,
		pokeSet.species.baseStats.spa,
		pokeSet.evs.spa,
		pokeSet.ivs.spa
	);
	
	pokeSet.stats.spd = quickCalcStat(
		pokeSet.level,
		pokeSet.nature.multipliers.spd,
		pokeSet.species.baseStats.spd,
		pokeSet.evs.spd,
		pokeSet.ivs.spd
	);
	
	pokeSet.stats.spe = quickCalcStat(
		pokeSet.level,
		pokeSet.nature.multipliers.spe,
		pokeSet.species.baseStats.spe,
		pokeSet.evs.spe,
		pokeSet.ivs.spe
	);
}

function initDomePoke(frontierPoke, level) {
	// If needed, add IVs
	if (!Object.hasOwn(frontierPoke, "ivs")) {
		// Tucker->Silver has 20 IVs, Tucker->Gold has 31. Normal pokes have the bugged 3
		switch (frontierPoke.instance) {
			case "TS":
				frontierPoke.ivs = { hp: 20, atk: 20, def: 20, spa: 20, spd: 20, spe: 20 };
				break;
			
			case "TG":
				frontierPoke.ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
				break;
			
			default:
				frontierPoke.ivs = { hp: 3, atk: 3, def: 3, spa: 3, spd: 3, spe: 3 };
				break;
		}
	}
	
	// Assume ability 1 unless manually set otherwise
	if (!Object.hasOwn(frontierPoke, "ability")) {
		frontierPoke.ability = frontierPoke.species.ability1;
	}
	
	// Correct the level if it mismatches with the supplied level
	// Calc the stats if they're missing, or if we had to change/assign the level
	if (!Object.hasOwn(frontierPoke, "stats") || 
	    !Object.hasOwn(frontierPoke, "level") ||
	    frontierPoke.level !== level
	) {
		frontierPoke.level = level;
		calcPokeSetStats(frontierPoke);
	}
}

function freeDomePoke(frontierPoke) {
	delete frontierPoke.ivs;
	delete frontierPoke.ability;
	delete frontierPoke.level;
	delete frontierPoke.stats;
}

function patchHiddenPower(move, ivs) {
	if (move.name !== "Hidden Power") {
		return;
	}
	
	let v = [ ivs.spd, ivs.spa, ivs.spe, ivs.def, ivs.atk, ivs.hp ];
	let bitConcat = function(acc, val) {
		return (acc << 1) | val;
	}
	
	let type  = v.map(x => x & 1).reduce(bitConcat);
	let power = v.map(x => x & 2).reduce(bitConcat) >>> 1;
	
	type  = Math.floor((type  * 15) / 63);
	power = Math.floor((power * 40) / 63) + 30;
	
	const intType = [
		"Fighting", "Flying", "Poison", "Ground",
		"Rock", "Bug", "Ghost", "Steel", "Fire",
		"Water", "Grass", "Electric", "Psychic",
		"Ice", "Dragon", "Dark"
	];
	
	// Modify supplied move object
	move.power = power;
	move.type  = types[ intType[type] ];
}


// Returns array of 4 damage reports. Each report is:
//
// {
//     dmgHp : {
//         base : [],  --- Array of any length of equally likely HP damage values, sorted from least to greatest
//         crit : []   --- Array of any length of equally likely HP damage values, sorted from least to greatest, if critical
//     },
//     critProb,       --- Probability of critical (Slash, Scope Lens, etc)
//     move            --- Reference to the move object that generated this report
// }
//
// if report[i] === null        :: Move in this slot does not exist.
// if report[i].dmgHp === null  :: Move does no damage. I.e. Growl, Trick
// if report[i].critProb === 0  :: report[i].dmgHp.crit may be null. Check before reading.
function calcDamageReport(defenderPoke, attackerPoke) {
	// Reject invalid poke
	if (defenderPoke.species === undefined ||
	    attackerPoke.species === undefined
	) {
		return [ null, null, null, null ];
	}
	
	// Array of damage data for each move
	let damageReport = [];
	
	for (let m = 0; m < attackerPoke.moves.length; m++) {
		// Make a shallow copy of this move object so we can freely modify it
		let move = {};
		Object.assign(move, attackerPoke.moves[m]);
		
		
		// Report object, initialized to empty, non-damaging move as default data
		let moveReport = {
			dmgHp    : null,
			critProb : 0,
			move     : move
		};
		
		
		// Patch Hidden Power immediately. Do this so it can trigger STAB and supereffective correctly
		if (move.name === "Hidden Power") {
			patchHiddenPower(move, attackerPoke.ivs);
		}
		
		// Patch Nature Power with swift in this case
		if (move.name === "Nature Power") {
			Object.assign(move, moves["Swift"]);
		}
		
		
		// Non-damaging move, skip it
		if (move.power === 0) {
			damageReport.push(moveReport);
			continue;
		}
		
		// Type multipliers and STAB
		// If a type-ignoring move, both are left as 1
		let typeMultiplier = 1;
		let stab = 1;
		if (!moveHasFlag(move.name, "ignoresType")) {
			typeMultiplier = typeMultiplierVsPoke(move, defenderPoke);
			
			if (move.type.name === attackerPoke.species.type1.name ||
			    (attackerPoke.species.type2 !== null && move.type.name === attackerPoke.species.type2.name)
			) {
				stab = 1.5;
			} else {
				stab = 1;
			}
		}
		
		// If type-immune, this move does no damage
		if (typeMultiplier === 0) {
			damageReport.push(moveReport);
			continue;
		}
		
		// Check immunity to damage due to ability (Wonder guard, Volt Absorb, Soundproof, etc)
		if (abilityImmunityVsPoke(move, defenderPoke)) {
			damageReport.push(moveReport);
			continue;
		}
		
		// Now that immunities are done, handle special moves.
		// Some patch the move object and continue on, others generate damage values immediately.
		// Confusingly, "continue" here means that this move loop breaks and we move to the next one.
		// "Break" here means that this switch block breaks, and we continue on with this move.
		if (move.power === null) {
			switch (move.name) {
				case "Dragon Rage":
					moveReport.dmgHp = {
						base : [ 40 ]
					};
					
					damageReport.push(moveReport);
					continue;
				
				case "SonicBoom":
					moveReport.dmgHp = {
						base : [ 20 ]
					};
					
					damageReport.push(moveReport);
					continue;
				
				case "Night Shade":
				case "Seismic Toss":
					moveReport.dmgHp = {
						base : [ attackerPoke.level ]
					};
					
					damageReport.push(moveReport);
					continue;
				
				case "Endeavor":
					// Assume both at full HP
					let hpDiff = defenderPoke.stats.hp - attackerPoke.stats.hp;
					if (hpDiff > 0) {
						moveReport.dmgHp = {
							base : [ hpDiff ]
						};
						// Move fails if hpDiff <= 0
					}
					
					damageReport.push(moveReport);
					continue;
				
				case "Super Fang":
					// 1/2 HP of the defender
					let dmg = defenderPoke.stats.hp >>> 1;
					if (dmg === 0) {
						dmg = 1;
					}
					
					moveReport.dmgHp = {
						base : [ dmg ]
					};
					
					damageReport.push(moveReport);
					continue;
				
				case "Psywave":
					// Range of 0.5x - 1.5x the attacker level
					let possibleDmg = [];
					for (let i = 0; i <= 10; i++) {
						let dmg = Math.floor((attackerPoke.level * ((10 * i) + 50)) / 100);
						if (dmg === 0) {
							dmg = 1;
						}
						
						possibleDmg.push(dmg);
					}
					
					moveReport.dmgHp = {
						base : possibleDmg
					};
					
					damageReport.push(moveReport);
					continue;
				
				case "Sheer Cold":
				case "Fissure":
				case "Guillotine":
				case "Horn Drill":
					// 32x target HP to trip a detection for OHKO elsewhere
					moveReport.dmgHp = {
						base : [ defenderPoke.stats.hp << 5 ]
					};
					
					damageReport.push(moveReport);
					continue;
				
				// Assume full health for Flail, Reversal
				case "Flail":
				case "Reversal":
					move.power = 20;
					break;
				
				// Assume max damage for Magnitude, Present
				case "Magnitude":
					move.power = 150;
					break;
				
				case "Present":
					move.power = 120;
					break;
				
				// Assume happiness set to 255 or 0 accordingly for Return/Frustration
				case "Return":
				case "Frustration":
					move.power = 102;
					break;
				
				case "Low Kick":
					// Weight is not included in the dataset so this is what I'm doing
					const lkd = "01251241241131231331213141323124124131212141121332131324332522424324511234"+
					            "25634341423445331511363414241513344115533413233444333442661132331323464441"+
					            "26511251241341323231342211111121241133311121131433141133152461315243153414"+
					            "12326423535344231224355545665112412413423231232313413412131231113235121234"+
					            "46142322456232311221242456264341224441234551223252424151212235132263454322"+
					            "13554666563466614";
					
					move.power = parseInt(lkd.charAt(defenderPoke.species.number)) * 20;
					break;
				
				default:
					// Not implemented: Magic Coat, Counter, Bide
					damageReport.push(moveReport);
					continue;
			}
		}
		
		// Effective stat manipulation via category, items
		let effectiveDefense;
		let effectiveAttack;
		if (move.type.category === "physical") {
			// Use physical attack and physical defense
			effectiveDefense = defenderPoke.stats.def;
			effectiveAttack  = attackerPoke.stats.atk;
			
			// Ditto + Metal Powder 2x defense boost 
			if (defenderPoke.species.name === "Ditto" && defenderPoke.item === "Metal Powder") {
				effectiveDefense <<= 1;
			}
			
			// Explosion/Selfdestruct halves defense of target
			if (moveHasFlag(move.name, "selfDestruction")) {
				effectiveDefense >>>= 1;
			}
			
			// Cubone/Marowak + Thick Club 2x attack boost
			if ((attackerPoke.species.name === "Marowak" || attackerPoke.species.name === "Cubone") &&
			    attackerPoke.item === "Thick Club"
			) {
				effectiveAttack <<= 1;
			}
			
			// Choice Band 1.5x attack boost
			if (attackerPoke.item === "Choice Band") {
				effectiveAttack += effectiveAttack >>> 1;
			}
			
			// Pure Power/Huge Power 2x attack boost
			if (attackerPoke.ability === "Huge Power" ||
			    attackerPoke.ability === "Pure Power"
			) {
				effectiveAttack <<= 1;
			}
			
			// Hustle 1.5x attack boost
			if (attackerPoke.ability === "Hustle") {
				effectiveAttack += effectiveAttack >>> 1;
			}
			
		} else {
			// Use special attack and special defense
			effectiveDefense = defenderPoke.stats.spd;
			effectiveAttack  = attackerPoke.stats.spa;
			
			// Clamperl + DeepSeaScale 2x special defense boost
			if (defenderPoke.species.name === "Clamperl" && defenderPoke.item === "DeepSeaScale") {
				effectiveDefense <<= 1;
			}
			
			// Clamperl + DeepSeaTooth 2x special attack boost
			if (attackerPoke.species.name === "Clamperl" && attackerPoke.item === "DeepSeaTooth") {
				effectiveAttack <<= 1;
			}
			
			// Pikachu + Light Ball 2x special attack boost
			if (attackerPoke.species.name === "Pikachu" && attackerPoke.item === "Light Ball") {
				effectiveAttack <<= 1;
			}
			
			// Thick fat halves attack power of Fire and Ice by halving the attack stat
			if (defenderPoke.ability === "Thick Fat" && (move.type.name === "Ice" || move.type.name === "Fire")) {
				effectiveAttack >>>= 1;
			}
		}
		
		// Held item type boost
		// Stupid Sea Incense needs its own case
		if (Object.hasOwn(itemTypeBoost, attackerPoke.item) && itemTypeBoost[attackerPoke.item] === move.type.name) {
			effectiveAttack = Math.floor(effectiveAttack * 1.1);
		} else if (attackerPoke.item === "Sea Incense" && move.type.name === "Water") {
			effectiveAttack = Math.floor(effectiveAttack * 1.05);
		}
		
		// Finally do main damage calc
		moveReport.dmgHp = calcDamageRange(attackerPoke.level, move.power, effectiveAttack, effectiveDefense, stab, typeMultiplier);
		
		// Calculate crit level
		if (defenderPoke.ability === "Shell Armor"  || 
		    defenderPoke.ability === "Battle Armor" || 
		    moveHasFlag(move.name, "cannotCrit")
		) {
			moveReport.critProb = 0;
		} else {
			let critLevel = 0;
			
			// Scope lens +1 crit boost
			if (attackerPoke.item === "Scope Lens") {
				critLevel += 1;
			}
			
			// Lucky Punch + Chansey +2 crit boost
			if (attackerPoke.item === "Lucky Punch" && attackerPoke.species.name === "Chansey") {
				critLevel += 2;
			}
			
			// Stick + Farfetch'd +2 crit boost
			if (attackerPoke.item === "Stick" && attackerPoke.species.name === "Farfetch'd") {
				critLevel += 2;
			}
			
			// High-crit moves +1 (Slash, Razor Wind, etc)
			if (moveHasFlag(move.name, "highCrit")) {
				critLevel += 1;
			}
			
			const critLevelProb = [ (1/16), (1/8), (1/4), (1/3), (1/2), (1/2) ];
			
			moveReport.critProb = critLevelProb[critLevel];
		}
		
		damageReport.push(moveReport);
	}
	
	// Pad to 4 moves
	while (damageReport.length < 4) {
		damageReport.push(null);
	}
	
	return damageReport;
}

// Probability that a damage report entry will break a substitute with X health
function subBreakAnalysis(damageInfo, subHealth) {
	let subBreakProb = 0;
	if (damageInfo === null || damageInfo.dmgHp === null) {
		return subBreakProb;
	}
	
	let critProb = damageInfo.critProb;
	let nonCritProb = 1 - critProb;
	
	let nonCritDmg = damageInfo.dmgHp.base;
	let nonCritSubBreak = nonCritDmg.filter(x => x >= subHealth);
	
	subBreakProb += (nonCritSubBreak.length / nonCritDmg.length) * nonCritProb;
	
	if (critProb !== 0) {
		let critDmg = damageInfo.dmgHp.crit;
		let critSubBreak = critDmg.filter(x => x >= subHealth);
		subBreakProb += (critSubBreak.length / critDmg.length) * critProb;
	}
	
	return subBreakProb;
}

// 0 : No danger
// 1 : Shedinja in danger of status/non-attack damage
// 2 : Shedinja in danger of attack
function shedinjaDangerCheck(attackerPoke, playerTeamSpeciesNames) {
	if (!playerTeamSpeciesNames.includes("Shedinja")) {
		return 0;
	}
	
	// Two loops to make sure a 2 always takes priority over a 1
	
	for (let m = 0; m < attackerPoke.moves.length; m++) {
		if (moveHasFlag(attackerPoke.moves[m].name, "shedinjaDanger")) {
			return 2;
		}
	}
	
	for (let m = 0; m < attackerPoke.moves.length; m++) {
		if (moveHasFlag(attackerPoke.moves[m].name, "shedinjaStatus")) {
			return 1;
		}
	}
	
	return 0;
}
