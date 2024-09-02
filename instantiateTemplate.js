"use strict";

function instantiateTemplate(templateEl) {
	let ret = {
		documentFragment : templateEl.content.cloneNode(true),
		elementId : {},
		elementGroup : {}
	};
	
	for (let node of ret.documentFragment.querySelectorAll("[data-template-id], [data-template-group]")) {
		let id = node.dataset.templateId;
		if (id && !Object.hasOwn(ret.elementId, id)) {
			ret.elementId[id] = node;
		}
		
		let groupStr = node.dataset.templateGroup;
		if (groupStr) {
			for (let group of new Set(groupStr.trim().split(/\s{1,}/))) {
				if (!Object.hasOwn(ret.elementGroup, group)) {
					ret.elementGroup[group] = [];
				}
				
				ret.elementGroup[group].push(node);
			}
		}
	}
	
	return ret;
}