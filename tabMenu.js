"use strict";

function tabMenuInit(ulId) {
	let menu = document.getElementById(ulId);
	let tabs = menu.getElementsByClassName("tabItem");
	for (let tab of tabs) {
		tab.firstElementChild.addEventListener("click", function(event) {
			event.preventDefault();
			for (let tab of tabs) {
				tab.classList.remove("active");
				document.getElementById(tab.dataset.tabMenuLink).style.display = "none";
				document.getElementById(tab.dataset.tabMenuLink).ariaHidden = "true";
			}
			
			this.parentNode.classList.add("active");
			document.getElementById(this.parentNode.dataset.tabMenuLink).style.display = "block";
			document.getElementById(tab.dataset.tabMenuLink).ariaHidden = "false";
		});
	}
}