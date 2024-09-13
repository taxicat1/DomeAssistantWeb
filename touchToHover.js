"use strict";

(function() {
	const touchToHover = {};
	
	touchToHover.availabilityClass = "touchToHover";
	touchToHover.activationClass   = "touched";
	
	touchToHover.activeEl = null;
	
	touchToHover.setTouchActivation = function(targetEl) {
		targetEl.classList.add(touchToHover.activationClass);
		touchToHover.activeEl = targetEl;
		
		// Listen for mouse movement that will also exit the pseudo-hover state
		// Useful for systems with both mouse and touch pointing
		window.addEventListener("mouseover", touchToHover.clearTouchActivation);
	};
	
	touchToHover.clearTouchActivation = function() {
		if (touchToHover.activeEl !== null) {
			touchToHover.activeEl.classList.remove(touchToHover.activationClass);
			touchToHover.activeEl = null;
			
			// Done this way rather than using { once: true }
			// because a touch event may also run this function
			// Removing the event listener at all is purely a performance concern
			window.removeEventListener("mouseover", touchToHover.clearTouchActivation);
		}
	};
	
	touchToHover.touchStart = function(touchEvent) {
		touchToHover.clearTouchActivation();
		
		if (touchEvent.target.classList.contains(touchToHover.availabilityClass)) {
			touchToHover.setTouchActivation(touchEvent.target);
		}
	};
	
	window.addEventListener("touchstart", touchToHover.touchStart);
})();
