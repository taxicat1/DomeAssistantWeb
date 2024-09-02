"use strict";

function offensiveScore(frontierPoke, playerTeamSpeciesNames) {
	let score = 0;
	for (let m = 0; m < frontierPoke.moves.length; m++) {
		if (frontierPoke.moves[m].power < 1) {
			continue;
		}
		
		for (let p = 0; p < playerTeamSpeciesNames.length; p++) {
			let playerPoke = pokemon[ playerTeamSpeciesNames[p] ];
			let effect;
			
			if (playerPoke.ability1 === "Levitate" && frontierPoke.moves[m].type.name === "Ground") {
				effect = 1;
			} else if (playerPoke.ability1 === "Wonder Guard") {
				effect = 1;
			} else {
				effect = frontierPoke.moves[m].type.multipliers.offensive[playerPoke.type1.name];
				if (playerPoke.type2) {
					effect *= frontierPoke.moves[m].type.multipliers.offensive[playerPoke.type2.name];
				}
			}
			
			switch (effect) {
				case 0:    score += 0;  break;
				case 0.25: score += 0;  break;
				case 0.5:  score += 0;  break;
				case 1:    score += 2;  break;
				case 2:    score += 4;  break;
				case 4:    score += 8;  break;
			}
		}
	}
	
	return score;
}

function defensiveScore(frontierPoke, playerTeamSpeciesNames) {
	let score = 0;
	for (let m = 0; m < frontierPoke.moves.length; m++) {
		if (frontierPoke.moves[m].power === 0) {
			continue;
		}
		
		for (let p = 0; p < playerTeamSpeciesNames.length; p++) {
			let playerPoke = pokemon[ playerTeamSpeciesNames[p] ];
			let effect;
			
			if (playerPoke.ability1 === "Levitate" && frontierPoke.moves[m].type.name === "Ground") {
				effect = 1;
			} else if (playerPoke.ability1 === "Wonder Guard") {
				effect = 1;
			} else {
				effect = frontierPoke.moves[m].type.multipliers.offensive[playerPoke.type1.name];
				if (playerPoke.type2) {
					effect *= frontierPoke.moves[m].type.multipliers.offensive[playerPoke.type2.name];
				}
			}
			
			switch (effect) {
				case 0:    score += 8;  break;
				case 0.25: score += 4;  break;
				case 0.5:  score += 2;  break;
				case 1:    score += 0;  break;
				case 2:    score -= 2;  break;
				case 4:    score -= 4;  break;
			}
		}
	}
	
	return score;
}

// JS String objects are copy-on-write so this is not a memory concern to just assign these around
const battleStyles = [
	"Willing to risk total disaster at times",
	"Skilled at enduring long battles",
	"Varies tactics to suit the opponent",
	"Has a tough winning pattern",
	"Occasionally uses a very rare move",
	"Uses startling and disruptive moves",
	"Constantly watches HP in battle",
	"Good at storing then loosing power",
	"Skilled at enfeebling foes",
	"Prefers tactics that rely on luck",
	"Attacks with a regal atmosphere",
	"Attacks with powerful, low-PP moves",
	"Skilled at enfeebling, then attacking",
	"Battles while enduring all attacks", 
	"Skilled at upsetting foes emotionally",
	"Uses strong and straightforward moves",
	"Aggressively uses strong moves",
	"Battles while cleverly dodging attacks",
	"Skilled at using upsetting attacks",
	"Uses many popular moves",
	"Has moves for powerful combinations",
	"Uses high-probability attacks",
	"Aggressively uses spectacular moves",
	"Emphasizes offense over defense",
	"Emphasizes defense over offense",
	"Attacks quickly with strong moves",
	"Often uses moves with added effects",
	"Uses a well-balanced mix of moves"
];

// This data structure is only for comparison purposes
// Specifically, the two stats are unordered data
class EvStyle {
	constructor(emphasis, stats) {
		this.emphasis = emphasis;
		
		if (stats.length > 2) {
			this.stats = stats.slice(2);
		} else if (stats.length === 2 && stats[0] === stats[1]) {
			this.stats = stats.slice(1);
		} else {
			this.stats = stats;
		}
	}
	
	isEqual(otherEvStyle) {
		if (this.emphasis !== otherEvStyle.emphasis) {
			return false;
		}
		
		if (this.emphasis === "Well-Balanced") {
			return true;
		}
		
		if (this.stats.length !== otherEvStyle.stats.length) {
			return false;
		}
		
		for (let i = 0; i < this.stats.length; i++) {
			if (!this.stats.includes(otherEvStyle.stats[i])) {
				return false;
			}
		}
		
		return true;
	}
}

class TrainerTeam {
	constructor(trainer, poke1, poke2, poke3) {
		this.pokes = [ poke1, poke2, poke3 ];
		this.trainer = trainer;
		
		// Values cached after being calculated
		this._evStyle = null;
		this._battleStyle = null;
		this._moveNamePool = null;
	}
	
	offensiveScores(playerTeamSpeciesNames) {
		return this.pokes.map(poke => offensiveScore(poke, playerTeamSpeciesNames));
	}
	
	defensiveScores(playerTeamSpeciesNames) {
		return this.pokes.map(poke => defensiveScore(poke, playerTeamSpeciesNames));
	}
	
	possiblePicks_wrong(playerTeamSpeciesNames) {
		// How the team picking is -supposed- to work
		
		let offensiveScores = this.offensiveScores(playerTeamSpeciesNames);
		let defensiveScores = this.defensiveScores(playerTeamSpeciesNames);
		
		// Polyfill
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
		
		let offensiveScores_sorted = toSorted(offensiveScores, (a, b) => a - b);
		let defensiveScores_sorted = toSorted(defensiveScores, (a, b) => a - b);
		
		// Detect if the scoring contains ties
		
		const ALL_DIFF      = 0
		const WINNER_TIE    = 1
		const LOSER_TIE     = 2
		const THREE_WAY_TIE = 3
		
		function scoreAnalysis(scores_sorted) {
			if (scores_sorted[0] === scores_sorted[1] && scores_sorted[1] === scores_sorted[2]) {
				return THREE_WAY_TIE;
			}
			
			if (scores_sorted[1] === scores_sorted[2]) {
				return WINNER_TIE;
			}
			
			if (scores_sorted[0] == scores_sorted[1]) {
				return LOSER_TIE;
			}
			
			return ALL_DIFF;
		}
		
		
		let offensiveAnalysis = scoreAnalysis(offensiveScores_sorted);
		let defensiveAnalysis = scoreAnalysis(defensiveScores_sorted);
		
		// Switch to the other if one is a three-way tie
		if (offensiveAnalysis === THREE_WAY_TIE && defensiveAnalysis !== THREE_WAY_TIE) {
			offensiveAnalysis      = defensiveAnalysis;
			offensiveScores        = defensiveScores;
			offensiveScores_sorted = defensiveScores_sorted;
		}
		
		if (defensiveAnalysis === THREE_WAY_TIE && offensiveAnalysis !== THREE_WAY_TIE) {
			defensiveAnalysis      = offensiveAnalysis;
			defensiveScores        = offensiveScores;
			defensiveScores_sorted = offensiveScores_sorted;
		}
		
		let numOutcomes = 0;
		let leftOutPokeCount = [ 0, 0, 0 ];
		for (let [ scores, scores_sorted, analysis ] of [ [offensiveScores, offensiveScores_sorted, offensiveAnalysis], 
		                                                  [defensiveScores, defensiveScores_sorted, defensiveAnalysis] ]
		) {
			switch(analysis) {
				case THREE_WAY_TIE:
					// Decide totally at random (3 possible outcomes)
					for (let i = 0; i < 3; i++) {
						leftOutPokeCount[i]++;
						numOutcomes++;
					}
					break;
				
				case LOSER_TIE:
					// Winner + random loser get picked (2 possible outcomes)
					let winnerIdx = scores.indexOf(scores_sorted[2]);
					for (let i = 0; i < 3; i++) {
						if (i === winnerIdx) {
							continue;
						}
						leftOutPokeCount[i]++;
						numOutcomes++;
					}
					break;
				
				case WINNER_TIE:
				case ALL_DIFF:
					// Two winners get picked (1 possible outcome)
					let loserIdx = scores.indexOf(scores_sorted[0]);
					leftOutPokeCount[loserIdx]++;
					numOutcomes++;
					break;
			}
		}
		
		let forwardPickRate = 0.6;
		if (this.trainer.index >= 300) {
			// Tucker uses different odds than everybody else
			forwardPickRate = 1;
		}
		
		let backwardPickRate = 1 - forwardPickRate;
		
		let outcomes = [
			{
				pokeIdx : [ 1, 2 ],
				probability : (leftOutPokeCount[0] / numOutcomes) * forwardPickRate
			},
			{
				pokeIdx : [ 2, 1 ],
				probability : (leftOutPokeCount[0] / numOutcomes) * backwardPickRate
			},
			
			{
				pokeIdx : [ 0, 2 ],
				probability : (leftOutPokeCount[1] / numOutcomes) * forwardPickRate
			},
			{
				pokeIdx : [ 2, 0 ],
				probability : (leftOutPokeCount[1] / numOutcomes) * backwardPickRate
			},
			
			{
				pokeIdx : [ 0, 1 ],
				probability : (leftOutPokeCount[2] / numOutcomes) * forwardPickRate
			},
			{
				pokeIdx : [ 1, 0 ],
				probability : (leftOutPokeCount[2] / numOutcomes) * backwardPickRate
			}
		];
		
		return outcomes;
	}
	
	possiblePicks_real(playerTeamSpeciesNames) {
		// How the team picking -actually- works
		// Ditto is not actually significant here;
		// just need any mono normal type without Levitate or Wonder Guard
		let perceivedTeams = [
			[ "Ditto",                   playerTeamSpeciesNames[1], playerTeamSpeciesNames[2]    ],
			[ playerTeamSpeciesNames[0], "Ditto",                   playerTeamSpeciesNames[2]    ],
			[ playerTeamSpeciesNames[0], playerTeamSpeciesNames[1], "Ditto"                      ],
		];
		
		// [idx] is also the player's left out poke
		return [
			{
				playerTeamIdx : [1, 2],
				outcomes : this.possiblePicks_wrong(perceivedTeams[0])
			},
			
			{
				playerTeamIdx : [0, 2],
				outcomes : this.possiblePicks_wrong(perceivedTeams[1])
			},
			
			{
				playerTeamIdx : [0, 1],
				outcomes : this.possiblePicks_wrong(perceivedTeams[2])
			}
		];
	}
	
	appearanceTable(playerTeamSpeciesNames) {
		let possiblePicks = this.possiblePicks_real(playerTeamSpeciesNames);
		
		let appearances = [
			[ 0, 0, 0 ],	// If your pokes are [1,2]
			[ 0, 0, 0 ],	// If your pokes are [0,2]
			[ 0, 0, 0 ] 	// If your pokes are [0,1]
		];
		
		/*
		let leads = [
			[ 0, 0, 0 ],	// If your pokes are [1,2]
			[ 0, 0, 0 ],	// If your pokes are [0,2]
			[ 0, 0, 0 ] 	// If your pokes are [0,1]
		];
		*/
		
		for (let i = 0; i < 3; i++) {
			let outcomes = possiblePicks[i].outcomes;
			for (let o = 0; o < outcomes.length; o++) {
				appearances[i][outcomes[o].pokeIdx[0]] += outcomes[o].probability;
				appearances[i][outcomes[o].pokeIdx[1]] += outcomes[o].probability;
				
				//leads[i][outcomes[o].pokeIdx[0]] += outcomes[o].probability;
			}
		}
		
		return appearances;
		
		/*
		return {
			appear: appearances,
			lead: leads
		};
		*/
	}
	
	hasMoves(moveNameList) {
		if (this._moveNamePool === null) {
			this._moveNamePool = this.pokes[0].moves.concat(this.pokes[1].moves)
			                                        .concat(this.pokes[2].moves).map(x => x.name);
		}
		
		for (let m = 0; m < moveNameList.length; m++) {
			if (!this._moveNamePool.includes(moveNameList[m])) {
				return false;
			}
		}
		
		return true;
	}
	
	battleStyle() {
		if (this._battleStyle) {
			return this._battleStyle;
		}
		
		let totalPoints = new Array(16).fill(0);
		
		// Use move pool if available
		if (this._moveNamePool) {
			for (let m = 0; m < this._moveNamePool.length; m++) {
				let move = moves[this._moveNamePool[m]];
				for (let d = 0; d < move.domePoints.length; d++) {
					totalPoints[d] += move.domePoints[d];
				}
			}
		} else {
			// Else just iterate pokemon -> moves
			for (let p = 0; p < this.pokes.length; p++) {
				let poke = this.pokes[p];
				for (let m = 0; m < poke.moves.length; m++) {
					let move = poke.moves[m];
					for (let d = 0; d < move.domePoints.length; d++) {
						totalPoints[d] += move.domePoints[d];
					}
				}
			}
		}
		
		function checkPoints(points) {
			let DMG       = points[0];
			let ACCURATE  = points[1];
			let RARE      = points[2];
			let EFFECT    = points[3];
			let LOWPP     = points[4];
			let COMBO     = points[5];
			let POPULAR   = points[6];
			let STATLOWER = points[7];
			let POWERFUL  = points[8];
			let STRONG    = points[9];
			let LUCK      = points[10];
			let STATRAISE = points[11];
			let HEAL      = points[12];
			let STATUS    = points[13];
			let RISKY     = points[14];
			let DEF       = points[15];
			
			if (RISKY >= 1) return 0;
			if (HEAL >= 2 && STATUS >= 1 && DEF >= 2) return 1;
			if (COMBO >= 1 && STATRAISE >= 1 && STATLOWER >= 1 && HEAL >= 1 && STATUS >= 1 && DEF >= 1) return 2;
			if (COMBO >= 3) return 3;
			if (RARE >= 2) return 4;
			if (RARE >= 1) return 5;
			if (HEAL >= 3) return 6;
			if (STATRAISE >= 1 && HEAL >= 1) return 7;
			if (STATLOWER >= 1 && STATUS >= 1) return 8;
			if (LUCK >= 2) return 9;
			if (STATRAISE >= 1 && HEAL >= 1 && DEF >= 1 && POPULAR >= 1 && STRONG >= 1) return 10; // Impossible due to 7
			if (LOWPP >= 3) return 11;
			if (STATRAISE >= 1 && STATUS >= 1) return 12;
			if (HEAL >= 2 && DEF >= 2) return 13;
			if (STATUS >= 2) return 14;
			if (ACCURATE >= 3 && STRONG >= 3) return 15;
			if (STRONG >= 4) return 16;
			if (DEF >= 3) return 17;
			if (STATLOWER >= 2 && STATUS >= 2) return 18; // Impossible due to 14 && 8
			if (POWERFUL >= 3 && POPULAR >= 3) return 19;
			if (COMBO >= 2) return 20;
			if (HEAL >= 1 && ACCURATE >= 3) return 21;
			if (POWERFUL >= 4) return 22;
			if (DMG >= 7) return 23;
			if (DEF >= 4) return 24; // Impossible due to 17
			if (POPULAR >= 2 && STRONG >= 4) return 25; // Impossible due to 16
			if (EFFECT >= 4) return 26;
			
			return 27;
		}
		
		this._battleStyle = battleStyles[checkPoints(totalPoints)];
		return this._battleStyle;
	}
	
	evStyle() {
		if (this._evStyle) {
			return this._evStyle;
		}
		
		// Must follow this order
		const statOrder = [ "spd", "spa", "spe", "def", "atk", "hp" ];
		
		let statList = new Array(6).fill(0);
		
		for (let i = 0; i < this.pokes.length; i++) {
			let poke = this.pokes[i];
			statList[0] += Math.floor(poke.evs.spd * poke.nature.multipliers.spd);
			statList[1] += Math.floor(poke.evs.spa * poke.nature.multipliers.spa);
			statList[2] += Math.floor(poke.evs.spe * poke.nature.multipliers.spe);
			statList[3] += Math.floor(poke.evs.def * poke.nature.multipliers.def);
			statList[4] += Math.floor(poke.evs.atk * poke.nature.multipliers.atk);
			statList[5] +=            poke.evs.hp;
		}
		
		// Must compute sum rather than just use 510 because natures are skewing the values
		let evSum = 0;
		for (let i = 0; i < statList.length; i++) {
			evSum += statList[i];
		}
		
		// Map to floored percentages
		statList = statList.map(x => Math.floor((x * 100) / evSum));
		
		// Function to break ties by the stat order, if needed
		function pickStats(vector) {
			// If only one true in vector
			if (vector.filter(x => x === true).length === 1) {
				return [ statOrder[ vector.indexOf(true) ] ];
			}
			
			// Else sort by stat order and pick the first two
			return vector.map((v, i) => v ? statOrder[i] : v) // Replace trues with the respective stat name
			             .filter(x => x !== false)            // Remove falses
			             .slice(0, 2);                        // Slice to length 2 or less
		}
		
		// Map to bools of which stats are emphasized
		let eVector = statList.map(x => x >=  30);
		
		// If any stat has emphasis, that takes priority
		if (eVector.includes(true)) {
			this._evStyle = new EvStyle("Emphasizes", pickStats(eVector));
			return this._evStyle;
		}
		
		// Else check if any stat is neglected
		// Map to bools again
		let nVector = statList.map(x => x === 0);
		
		if (nVector.includes(true)) {
			this._evStyle = new EvStyle("Neglects", pickStats(nVector));
			return this._evStyle;
		}
		
		// Else return Well-Balanced
		this._evStyle = new EvStyle("Well-Balanced", []);
		return this._evStyle;
	}
}
