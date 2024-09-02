"use strict";
const types = {
	"Normal" : {
		name : "Normal",
		index : 0,
		category : "physical",
		multipliers : {
			offensive:{"Normal":1,"Fighting":1,"Flying":1,"Poison":1,"Ground":1,"Rock":0.5,"Bug":1,"Ghost":0,"Steel":0.5,"Fire":1,"Water":1,"Grass":1,"Electric":1,"Psychic":1,"Ice":1,"Dragon":1,"Dark":1,"???":null},
			defensive:{"Normal":1,"Fighting":2,"Flying":1,"Poison":1,"Ground":1,"Rock":1,"Bug":1,"Ghost":0,"Steel":1,"Fire":1,"Water":1,"Grass":1,"Electric":1,"Psychic":1,"Ice":1,"Dragon":1,"Dark":1,"???":null}
		}
	},
	
	"Fighting" : {
		name : "Fighting",
		index : 6,
		category : "physical",
		multipliers : {
			offensive:{"Normal":2,"Fighting":1,"Flying":0.5,"Poison":0.5,"Ground":1,"Rock":2,"Bug":0.5,"Ghost":0,"Steel":2,"Fire":1,"Water":1,"Grass":1,"Electric":1,"Psychic":0.5,"Ice":2,"Dragon":1,"Dark":2,"???":null},
			defensive:{"Normal":1,"Fighting":1,"Flying":2,"Poison":1,"Ground":1,"Rock":0.5,"Bug":0.5,"Ghost":1,"Steel":1,"Fire":1,"Water":1,"Grass":1,"Electric":1,"Psychic":2,"Ice":1,"Dragon":1,"Dark":0.5,"???":null}
		}
	},
	
	"Flying" : {
		name : "Flying",
		index : 9,
		category : "physical",
		multipliers : {
			offensive:{"Normal":1,"Fighting":2,"Flying":1,"Poison":1,"Ground":1,"Rock":0.5,"Bug":2,"Ghost":1,"Steel":0.5,"Fire":1,"Water":1,"Grass":2,"Electric":0.5,"Psychic":1,"Ice":1,"Dragon":1,"Dark":1,"???":null},
			defensive:{"Normal":1,"Fighting":0.5,"Flying":1,"Poison":1,"Ground":0,"Rock":2,"Bug":0.5,"Ghost":1,"Steel":1,"Fire":1,"Water":1,"Grass":0.5,"Electric":2,"Psychic":1,"Ice":2,"Dragon":1,"Dark":1,"???":null}
		}
	},
	
	"Poison" : {
		name : "Poison",
		index : 7,
		category : "physical",
		multipliers : {
			offensive:{"Normal":1,"Fighting":1,"Flying":1,"Poison":0.5,"Ground":0.5,"Rock":0.5,"Bug":1,"Ghost":0.5,"Steel":0,"Fire":1,"Water":1,"Grass":2,"Electric":1,"Psychic":1,"Ice":1,"Dragon":1,"Dark":1,"???":null},
			defensive:{"Normal":1,"Fighting":0.5,"Flying":1,"Poison":0.5,"Ground":2,"Rock":1,"Bug":0.5,"Ghost":1,"Steel":1,"Fire":1,"Water":1,"Grass":0.5,"Electric":1,"Psychic":2,"Ice":1,"Dragon":1,"Dark":1,"???":null}
		}
	},
	
	"Ground" : {
		name : "Ground",
		index : 8,
		category : "physical",
		multipliers : {
			offensive:{"Normal":1,"Fighting":1,"Flying":0,"Poison":2,"Ground":1,"Rock":2,"Bug":0.5,"Ghost":1,"Steel":2,"Fire":2,"Water":1,"Grass":0.5,"Electric":2,"Psychic":1,"Ice":1,"Dragon":1,"Dark":1,"???":null},
			defensive:{"Normal":1,"Fighting":1,"Flying":1,"Poison":0.5,"Ground":1,"Rock":0.5,"Bug":1,"Ghost":1,"Steel":1,"Fire":1,"Water":2,"Grass":2,"Electric":0,"Psychic":1,"Ice":2,"Dragon":1,"Dark":1,"???":null}
		}
	},
	
	"Rock" : {
		name : "Rock",
		index : 12,
		category : "physical",
		multipliers : {
			offensive:{"Normal":1,"Fighting":0.5,"Flying":2,"Poison":1,"Ground":0.5,"Rock":1,"Bug":2,"Ghost":1,"Steel":0.5,"Fire":2,"Water":1,"Grass":1,"Electric":1,"Psychic":1,"Ice":2,"Dragon":1,"Dark":1,"???":null},
			defensive:{"Normal":0.5,"Fighting":2,"Flying":0.5,"Poison":0.5,"Ground":2,"Rock":1,"Bug":1,"Ghost":1,"Steel":2,"Fire":0.5,"Water":2,"Grass":2,"Electric":1,"Psychic":1,"Ice":1,"Dragon":1,"Dark":1,"???":null}
		}
	},
	
	"Bug" : {
		name : "Bug",
		index : 11,
		category : "physical",
		multipliers : {
			offensive:{"Normal":1,"Fighting":0.5,"Flying":0.5,"Poison":0.5,"Ground":1,"Rock":1,"Bug":1,"Ghost":0.5,"Steel":0.5,"Fire":0.5,"Water":1,"Grass":2,"Electric":1,"Psychic":2,"Ice":1,"Dragon":1,"Dark":2,"???":null},
			defensive:{"Normal":1,"Fighting":0.5,"Flying":2,"Poison":1,"Ground":0.5,"Rock":2,"Bug":1,"Ghost":1,"Steel":1,"Fire":2,"Water":1,"Grass":0.5,"Electric":1,"Psychic":1,"Ice":1,"Dragon":1,"Dark":1,"???":null}
		}
	},
	
	"Ghost" : {
		name : "Ghost",
		index : 13,
		category : "physical",
		multipliers : {
			offensive:{"Normal":0,"Fighting":1,"Flying":1,"Poison":1,"Ground":1,"Rock":1,"Bug":1,"Ghost":2,"Steel":0.5,"Fire":1,"Water":1,"Grass":1,"Electric":1,"Psychic":2,"Ice":1,"Dragon":1,"Dark":0.5,"???":null},
			defensive:{"Normal":0,"Fighting":0,"Flying":1,"Poison":0.5,"Ground":1,"Rock":1,"Bug":0.5,"Ghost":2,"Steel":1,"Fire":1,"Water":1,"Grass":1,"Electric":1,"Psychic":1,"Ice":1,"Dragon":1,"Dark":2,"???":null}
		}
	},
	
	"Steel" : {
		name : "Steel",
		index : 16,
		category : "physical",
		multipliers : {
			offensive:{"Normal":1,"Fighting":1,"Flying":1,"Poison":1,"Ground":1,"Rock":2,"Bug":1,"Ghost":1,"Steel":0.5,"Fire":0.5,"Water":0.5,"Grass":1,"Electric":0.5,"Psychic":1,"Ice":2,"Dragon":1,"Dark":1,"???":null},
			defensive:{"Normal":0.5,"Fighting":2,"Flying":0.5,"Poison":0,"Ground":2,"Rock":0.5,"Bug":0.5,"Ghost":0.5,"Steel":0.5,"Fire":2,"Water":1,"Grass":0.5,"Electric":1,"Psychic":0.5,"Ice":0.5,"Dragon":0.5,"Dark":0.5,"???":null}
		}
	},
	
	"Fire" : {
		name : "Fire",
		index : 1,
		category : "special",
		multipliers : {
			offensive:{"Normal":1,"Fighting":1,"Flying":1,"Poison":1,"Ground":1,"Rock":0.5,"Bug":2,"Ghost":1,"Steel":2,"Fire":0.5,"Water":0.5,"Grass":2,"Electric":1,"Psychic":1,"Ice":2,"Dragon":0.5,"Dark":1,"???":null},
			defensive:{"Normal":1,"Fighting":1,"Flying":1,"Poison":1,"Ground":2,"Rock":2,"Bug":0.5,"Ghost":1,"Steel":0.5,"Fire":0.5,"Water":2,"Grass":0.5,"Electric":1,"Psychic":1,"Ice":0.5,"Dragon":1,"Dark":1,"???":null}
		}
	},
	
	"Water" : {
		name : "Water",
		index : 2,
		category : "special",
		multipliers : {
			offensive:{"Normal":1,"Fighting":1,"Flying":1,"Poison":1,"Ground":2,"Rock":2,"Bug":1,"Ghost":1,"Steel":1,"Fire":2,"Water":0.5,"Grass":0.5,"Electric":1,"Psychic":1,"Ice":1,"Dragon":0.5,"Dark":1,"???":null},
			defensive:{"Normal":1,"Fighting":1,"Flying":1,"Poison":1,"Ground":1,"Rock":1,"Bug":1,"Ghost":1,"Steel":0.5,"Fire":0.5,"Water":0.5,"Grass":2,"Electric":2,"Psychic":1,"Ice":0.5,"Dragon":1,"Dark":1,"???":null}
		}
	},
	
	"Grass" : {
		name : "Grass",
		index : 4,
		category : "special",
		multipliers : {
			offensive:{"Normal":1,"Fighting":1,"Flying":0.5,"Poison":0.5,"Ground":2,"Rock":2,"Bug":0.5,"Ghost":1,"Steel":0.5,"Fire":0.5,"Water":2,"Grass":0.5,"Electric":1,"Psychic":1,"Ice":1,"Dragon":0.5,"Dark":1,"???":null},
			defensive:{"Normal":1,"Fighting":1,"Flying":2,"Poison":2,"Ground":0.5,"Rock":1,"Bug":2,"Ghost":1,"Steel":1,"Fire":2,"Water":0.5,"Grass":0.5,"Electric":0.5,"Psychic":1,"Ice":2,"Dragon":1,"Dark":1,"???":null}
		}
	},
	
	"Electric" : {
		name : "Electric",
		index : 3,
		category : "special",
		multipliers : {
			offensive:{"Normal":1,"Fighting":1,"Flying":2,"Poison":1,"Ground":0,"Rock":1,"Bug":1,"Ghost":1,"Steel":1,"Fire":1,"Water":2,"Grass":0.5,"Electric":0.5,"Psychic":1,"Ice":1,"Dragon":0.5,"Dark":1,"???":null},
			defensive:{"Normal":1,"Fighting":1,"Flying":0.5,"Poison":1,"Ground":2,"Rock":1,"Bug":1,"Ghost":1,"Steel":0.5,"Fire":1,"Water":1,"Grass":1,"Electric":0.5,"Psychic":1,"Ice":1,"Dragon":1,"Dark":1,"???":null}
		}
	},
	
	"Psychic" : {
		name : "Psychic",
		index : 10,
		category : "special",
		multipliers : {
			offensive:{"Normal":1,"Fighting":2,"Flying":1,"Poison":2,"Ground":1,"Rock":1,"Bug":1,"Ghost":1,"Steel":0.5,"Fire":1,"Water":1,"Grass":1,"Electric":1,"Psychic":0.5,"Ice":1,"Dragon":1,"Dark":0,"???":null},
			defensive:{"Normal":1,"Fighting":0.5,"Flying":1,"Poison":1,"Ground":1,"Rock":1,"Bug":2,"Ghost":2,"Steel":1,"Fire":1,"Water":1,"Grass":1,"Electric":1,"Psychic":0.5,"Ice":1,"Dragon":1,"Dark":2,"???":null}
		}
	},
	
	"Ice" : {
		name : "Ice",
		index : 5,
		category : "special",
		multipliers : {
			offensive:{"Normal":1,"Fighting":1,"Flying":2,"Poison":1,"Ground":2,"Rock":1,"Bug":1,"Ghost":1,"Steel":0.5,"Fire":0.5,"Water":0.5,"Grass":2,"Electric":1,"Psychic":1,"Ice":0.5,"Dragon":2,"Dark":1,"???":null},
			defensive:{"Normal":1,"Fighting":2,"Flying":1,"Poison":1,"Ground":1,"Rock":2,"Bug":1,"Ghost":1,"Steel":2,"Fire":2,"Water":1,"Grass":1,"Electric":1,"Psychic":1,"Ice":0.5,"Dragon":1,"Dark":1,"???":null}
		}
	},
	
	"Dragon" : {
		name : "Dragon",
		index : 14,
		category : "special",
		multipliers : {
			offensive:{"Normal":1,"Fighting":1,"Flying":1,"Poison":1,"Ground":1,"Rock":1,"Bug":1,"Ghost":1,"Steel":0.5,"Fire":1,"Water":1,"Grass":1,"Electric":1,"Psychic":1,"Ice":1,"Dragon":2,"Dark":1,"???":null},
			defensive:{"Normal":1,"Fighting":1,"Flying":1,"Poison":1,"Ground":1,"Rock":1,"Bug":1,"Ghost":1,"Steel":1,"Fire":0.5,"Water":0.5,"Grass":0.5,"Electric":0.5,"Psychic":1,"Ice":2,"Dragon":2,"Dark":1,"???":null}
		}
	},
	
	"Dark" : {
		name : "Dark",
		index : 15,
		category : "special",
		multipliers : {
			offensive:{"Normal":1,"Fighting":0.5,"Flying":1,"Poison":1,"Ground":1,"Rock":1,"Bug":1,"Ghost":2,"Steel":0.5,"Fire":1,"Water":1,"Grass":1,"Electric":1,"Psychic":2,"Ice":1,"Dragon":1,"Dark":0.5,"???":null},
			defensive:{"Normal":1,"Fighting":2,"Flying":1,"Poison":1,"Ground":1,"Rock":1,"Bug":2,"Ghost":0.5,"Steel":1,"Fire":1,"Water":1,"Grass":1,"Electric":1,"Psychic":0,"Ice":1,"Dragon":1,"Dark":0.5,"???":null}
		}
	},
	
	"???" : {
		name : "???",
		index : -1,
		category : null,
		multipliers : {
			offensive:{"Normal":null,"Fighting":null,"Flying":null,"Poison":null,"Ground":null,"Rock":null,"Bug":null,"Ghost":null,"Steel":null,"Fire":null,"Water":null,"Grass":null,"Electric":null,"Psychic":null,"Ice":null,"Dragon":null,"Dark":null},
			defensive:{"Normal":null,"Fighting":null,"Flying":null,"Poison":null,"Ground":null,"Rock":null,"Bug":null,"Ghost":null,"Steel":null,"Fire":null,"Water":null,"Grass":null,"Electric":null,"Psychic":null,"Ice":null,"Dragon":null,"Dark":null,"???":null}
		}
	}
};
