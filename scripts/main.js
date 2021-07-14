const moduleName = "feature-name-replacer";

Hooks.on("init", () => {
	const moduleName = "feature-name-replacer";
	game.settings.register(moduleName,"replaceKeywords", {
		name: "SETTINGS.FNR.replaceKeywords",
		hint: "SETTINGS.FNR.replaceKeywordsHint",
		config: true,
		default: "creature;type",
		scope: "world",
		type: String
	});

	game.settings.register(moduleName,"namedCreaturesList", {
		name: "SETTINGS.FNR.namedCreaturesList",
		hint: "SETTINGS.FNR.namedCreaturesListHint",
		config: true,
		default: "",
		scope: "world",
		type: String
	});

	game.settings.register(moduleName,"descriptionDataPath", {
		name: "SETTINGS.FNR.descriptionDataPath",
		hint: "SETTINGS.FNR.descriptionDataPathHint",
		config: true,
		default: "data.description.value",
		scope: "world",
		type: String
	});
});


/**
 * Replace {creature} and {type} in the description text with the 
 * creature's name.
 * If the creature happens to be a Named Creature, then also remove any
 * preceding article ("the").
 * @param {Item} [item]				The feature item that is added to the actor
 * @return {void}					Return nothing to continue
 */
async function replaceMonsterName(item) {
	let featureDesc = item.data?.[game.settings.get(moduleName, "descriptionDataPath")];
	if (!featureDesc) return;
	let keywords = game.settings.get(moduleName,"replaceKeywords");
	let splitKeywords = keywords.split(";");
	for (let i = 0; i < splitKeywords.length; i++) {
		if (splitKeywords[i] === "") {
			splitKeywords.splice(i,1);
			i--;
		}
	}
	let regexString = "";
	for (let i = 0; i < splitKeywords.length; i++) {
		if (i === splitKeywords.length - 1) {
			regexString += `\{${splitKeywords[i]}\}`;	
		} else {
			regexString += `\{${splitKeywords[i]}\}|`;
		}
	}
	let regex = new RegExp(regexString,"g");
	let regexNamedCreature = new RegExp(`(The\\\W|the\\\W)?(${regexString})`,"g");
	
	// let regex = /\{creature\}|\{type\}/g;
	if (item.actor.getFlag(moduleName, "namedCreature") || item.actor.type === "character" || checkNamedCreatureList(item)) {
		// regex = /(The\W|the\W)?(\{creature\}|\{type\})/g;
		featureDesc = featureDesc.replaceAll(regexNamedCreature, item.actor.name);
	} else if (item.actor.getFlag(moduleName, "namedCreature") === undefined) {
		await item.actor.setFlag(moduleName, "namedCreature", false);
		featureDesc = featureDesc.replaceAll(regex, item.actor.name.toLowerCase());
	} else {
		featureDesc = featureDesc.replaceAll(regex, item.actor.name.toLowerCase());
	}

	// if (item.name !== monsterFeature.name) return;
	await item.update({"data.description.value": featureDesc});
}

/**
 * Inject the handlebars template for the Named Creature option into 
 * the ActorTypeConfig application.
 * @param {ActorTypeConfig} [args]	The ActorTypeConfig application data
 * @param {string} [html]			The rendered html of the ActorTypeConfig application
 * @return {void}					Return nothing to continue
 */
async function injectNamedCreatureOption(args, html) {
	if (game.system.id !== "dnd5e") return;
	let data = {value: false};
	if (args.object.getFlag(moduleName, "namedCreature") || args.object.type === "character") {
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
 * @return {void}					Return nothing to continue
 */
async function detectNamedCreatureOption(args, html) {
	if (game.system.id !== "dnd5e") return;
	if (html.find('input[name="namedCreature"]')[0].checked) {
		await args.object.setFlag(moduleName, "namedCreature", true);
	} else {
		await args.object.setFlag(moduleName, "namedCreature", false);
	}
}

/**
 * Checks the list of named creatures against the item owner's name.
 * @param {Item} [item]				The item being added to the actor sheet
 * @returns {boolean}				Whether or not the named creature list includes the item owner's name
 */
function checkNamedCreatureList(item) {
	const namedCreaturesList = game.settings.get(moduleName, "namedCreaturesList");
	let splitNames = namedCreaturesList.split(";");
	for (let i = 0; i < splitNames.length; i++) {
		if (splitNames[i] === "") {
			splitNames.splice(i,1);
			i--;
		}
	}
	if (splitNames.includes(item.parent.name)) {
		return true;
	} else {
		return false;
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