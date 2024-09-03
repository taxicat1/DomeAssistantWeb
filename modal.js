"use strict";

function modalInit() {
	const modal = {};
	
	modal.container = document.getElementById("modalContainer");
	modal.topX      = document.getElementById("modalTopX");
	modal.popup     = document.getElementById("modalPopup");
	modal.overlay   = document.getElementById("modalOverlay");
	
	function checkAsleep(event) {
		if (event.target === modal.container && !modal.container.classList.contains("open")) {
			modal.container.classList.add("asleep");
		}
	}
	
	modal.container.addEventListener("transitionend",    checkAsleep);
	modal.container.addEventListener("transitioncancel", checkAsleep);
	
	modal.open = function() {
		modal.container.classList.remove("asleep");
		
		// BUG: in some browsers, the CSS transition doesn't trigger if
		//      the addition to the visible DOM and alteration to the 
		//      transition rule happen in the same repaint.
		setTimeout(function() {
			modal.container.classList.add("open");
		}, 5);
	}
	
	modal.close = function() {
		modal.container.classList.remove("open");
	}
	
	modal.captureKeyPress = function(event) {
		// Do nothing is modal is not open
		if (!modal.container.classList.contains("open")) {
			return;
		}
		
		// No keypresses are allowed to interact with any lower event listeners
		event.stopImmediatePropagation();
		
		switch (event.key) {
			case "Tab":
				// Move focus into the modal if it somehow isn't already
				if (!modal.container.contains(document.activeElement)) {
					event.preventDefault();
					modal.firstTab.focus();
					break;
				}
				
				// Clamp tabbing to the next element to the selectable elements within the modal
				// Shift key reverses the direction
				if (event.shiftKey) {
					if (document.activeElement === modal.firstTab) {
						event.preventDefault();
						modal.lastTab.focus();
					}
				} else {
					if (document.activeElement === modal.lastTab) {
						event.preventDefault();
						modal.firstTab.focus();
					}
				}
				
				break;
			
			case "Escape":
				event.preventDefault();
				modal.close();
				break;
			
			case "Enter":
				// The enter key interacting with checkboxes can be unreliable
				event.preventDefault();
				if (modal.container.contains(document.activeElement)) {
					document.activeElement.click();
				}
				break;
		}
	};
	
	window.addEventListener("keydown", modal.captureKeyPress, { capturing : true });
	
	
	modal.overlay.addEventListener("click", modal.close);
	modal.popup.addEventListener("click", function(event) { event.stopPropagation() });
	modal.topX.addEventListener("click", modal.close);
	
	return modal;
}