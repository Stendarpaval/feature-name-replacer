const moduleName = "feature-name-replacer";

/**
 * Check if the item originates from the Monster Features compendium
 * and if so, replace {creature} and {type} with the creature's name.
 * If the creature happens to be a Named Creature, then also remove any
 * preceding article ("the").
 * @param {Item5e} [item]			The feature item that is added to the actor
 * @return {void}					Return nothing to continue
 */
async function replaceMonsterName(item) {
	let featureDesc = item.data.data?.description.value;
	if (!featureDesc) return;
	
	let replacementData = {
		creature: {
			isName: false,
			dataPath: "data.name",
			regex: new RegExp(`{creature}`,"g")
		},
		namedCreature: {
			isName: true,
			dataPath: "data.name",
			regex: new RegExp(`(The\\\W|the\\\W)?({creature})`,"g")
		},
		type: {
			isName: false,
			dataPath: "data.data.details.type.value",
			regex: new RegExp(`{type}`,"g")
		}
	};

	if (item.actor.getFlag(moduleName, "namedCreature") || item.actor.type === "character") {
		if (item[replacementData.namedCreature.dataPath]) {
			featureDesc = featureDesc.replaceAll(replacementData.namedCreature.regex, item[replacementData.namedCreature.dataPath]);
		}
	} else if (item.actor.getFlag(moduleName, "namedCreature") === undefined) {
		await item.actor.setFlag(moduleName, "namedCreature", false);
		if (item[replacementData.creature.dataPath]) {
			featureDesc = featureDesc.replaceAll(replacementData.creature.regex, item[replacementData.creature.dataPath].toLowerCase());
		}
	} else if (item[replacementData.creature.dataPath]) {
		featureDesc = featureDesc.replaceAll(replacementData.creature.regex, item[replacementData.creature.dataPath].toLowerCase());
	}
	
	if (item[replacementData.type.dataPath]) {
		featureDesc = featureDesc.replaceAll(replacementData.type.regex, item[replacementData.type.dataPath].toLowerCase());
	}

	await item.update({"data.description.value": featureDesc});
}

/**
 * Inject the handlebars template for the Named Creature option into 
 * the ActorTypeConfig application.
 * @param {ActorTypeConfig} [args]	The ActorTypeConfig application data
 * @param {string} [html]			The rendered html of the ActorTypeConfig application
 */
async function injectNamedCreatureOption(args, html) {
	let data = {value: false};
	if (args.object.getFlag(moduleName, "namedCreature")  || item.actor.type === "character") {
		data.value = true;
	} else if (args.object.getFlag(moduleName, "namedCreature") === undefined) {
		await args.object.setFlag(moduleName, "namedCreature", false);
	}
	
	const namedCreatureHtml = await renderTemplate('modules/feature-name-replacer/templates/named-creature.html', data);
	html.css({height: 'auto'}).find('button[type="submit"]').before(namedCreatureHtml);
}

/**
 * Detect the value of the Named Creature option when the ActorTypeConfig
 * application is closed.
 * @param {ActorTypeConfig} [args]	The ActorTypeConfig application data
 * @param {string} [html]			The rendered html of the ActorTypeConfig application
 */
async function detectNamedCreatureOption(args, html) {
	if (html.find('input[name="namedCreature"]')[0].checked) {
		await args.object.setFlag(moduleName, "namedCreature", true);
	} else {
		await args.object.setFlag(moduleName, "namedCreature", false);
	}
}

// Tie functions to relevant hooks
Hooks.on("createItem", async (item) => {
	await replaceMonsterName(item);
});

Hooks.on("renderActorTypeConfig", async (args, html) => {
	await injectNamedCreatureOption(args, html);
});

Hooks.on("closeActorTypeConfig", async (args, html) => {
	await detectNamedCreatureOption(args, html);
});
