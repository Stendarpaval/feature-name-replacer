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
	const sourceIdPrefix = "Compendium.dnd5e.monsterfeatures.";
	if (!item.getFlag("core","sourceId").startsWith(sourceIdPrefix)) return;
	const sourceId = item.getFlag("core","sourceId").slice(sourceIdPrefix.length);
	
	const mfCompendium = await game.packs.get("dnd5e.monsterfeatures");
	const monsterFeature = mfCompendium.get(sourceId);
	if (!monsterFeature) return;
	
	let featureDesc = monsterFeature.data.data.description.value;
	let regex = /\{creature\}|\{type\}/g;
	if (item.actor.getFlag(moduleName, "namedCreature")) {
		regex = /(The\W|the\W)?(\{creature\}|\{type\})/g;
		featureDesc = featureDesc.replaceAll(regex, item.actor.name);
	} else if (item.actor.getFlag(moduleName, "namedCreature") === undefined) {
		await item.actor.setFlag(moduleName, "namedCreature", false);
		featureDesc = featureDesc.replaceAll(regex, item.actor.name.toLowerCase());
	} else {
		featureDesc = featureDesc.replaceAll(regex, item.actor.name.toLowerCase());
	}

	if (item.name !== monsterFeature.name) return;
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
	if (args.object.getFlag(moduleName, "namedCreature")) {
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