"use strict";

function makeOptionEl(val, text) {
	let option = document.createElement("option");
	if (text) {
		option.textContent = text;
		option.value = val;
	} else {
		// Allow default behavior of falling back to textContent for value
		option.textContent = val;
	}
	return option;
}

function bindTextToSelect(selectEl, textEl, compareMode) {
	compareMode = compareMode || "textContent";
	
	function getSelectOptionIndexByPrefix(selectEl, inputText, compareMode) {
		if (inputText.length === 0) {
			return -1;
		}
		
		inputText = inputText.toLocaleLowerCase();
		
		// Pokemon-specific hack!
		// Ordinarily I treat all 'é' in the searchable names as 'e', but what if the user actually types 'é'? Still has to work!
		inputText = inputText.replaceAll("\xe9", "e");
		
		if (selectEl.dataset.alphabetized) {
			// Binary search
			let idxl = 0;
			let idxh = selectEl.options.length - 1;
			while (idxl != idxh) {
				let idxc = (idxl + idxh) >>> 1;
				let text = selectEl.options[idxc][compareMode].toLocaleLowerCase();
				switch (inputText.localeCompare(text)) {
					case 1:
						idxl = idxc + 1;
						break;
					
					case -1:
						idxh = idxc;
						break;
					
					case 0:
						// localeCompare returning 0 means the two supplied strings are equal
						return idxc;
				}
			}
			
			// idxl now contains the first index which is alphabetically after the inputText string
			
			let text = selectEl.options[idxl][compareMode].toLocaleLowerCase();
			if (text.startsWith(inputText)) {
				return idxl;
			}
			
		} else {
			// Non-alphabetized list, use sequential search
			for (let i = 0; i < selectEl.options.length; i++) {
				let text = selectEl.options[i].textContent.toLocaleLowerCase();
				if (text.startsWith(inputText)) {
					return i;
				}
			}
		}
		
		return -1;
	}
	
	function matchOrTruncate(selectEl, textEl, compareMode) {
		let index;
		do {
			index = getSelectOptionIndexByPrefix(selectEl, textEl.value, compareMode);
			if (index === -1) {
				textEl.value = textEl.value.slice(0, -1);
			}
		} while (index === -1 && textEl.value.length !== 0);
		
		selectEl.selectedIndex = index;
		selectEl.dispatchEvent(new Event("change"));
	}
	
	selectEl.addEventListener("input", function() {
		if (selectEl.selectedIndex === -1 ) {
			textEl.value = "";
		} else {
			textEl.value = selectEl.options[selectEl.selectedIndex].textContent;
		}
	});
	
	textEl.addEventListener("input", function() {
		matchOrTruncate(selectEl, textEl, compareMode);
	});
	
	matchOrTruncate(selectEl, textEl, compareMode);
}

function clearFormEl(el) {
	if (el.checked !== undefined) {
		el.checked = false;
	}
	
	if (el.type === "text" || el.type === "textarea") {
		el.value = "";
	}
	
	if (el.selectedIndex !== undefined) {
		el.selectedIndex = -1;
	}
	
	if (el.dispatchEvent) {
		el.dispatchEvent(new Event("change"));
		el.dispatchEvent(new Event("input"));
	}
}

function freezeFormEl(el) {
	el.disabled = true;
	el.tabIndex = -1;
	
	if (el.dataset.daLinkedText) {
		freezeFormEl(document.getElementById(el.dataset.daLinkedText));
	}
	
	if (el.dataset.daLinkedClear) {
		freezeFormEl(document.getElementById(el.dataset.daLinkedClear));
	}
	
	if (el === document.activeElement) {
		document.body.focus();
	}
}

function unfreezeFormEl(el) {
	el.disabled = false;
	el.tabIndex = 0;
	
	if (el.dataset.daLinkedText) {
		unfreezeFormEl(document.getElementById(el.dataset.daLinkedText));
	}
	
	if (el.dataset.daLinkedClear) {
		unfreezeFormEl(document.getElementById(el.dataset.daLinkedClear));
	}
}

function loadLocalStorage(el) {
	if (!el.id) {
		return;
	}
	
	let val = localStorage.getItem("FORM_" + el.id);
	if (val) {
		el.value = val;
		el.dispatchEvent(new Event("change"));
	}
}

function saveLocalStorage(el) {
	if (!el.id) {
		return;
	}
	
	localStorage.setItem("FORM_" + el.id, el.value);
}

function removeInvalid(x) {
	return !!x;
}