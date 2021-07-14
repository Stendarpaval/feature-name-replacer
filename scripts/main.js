const moduleName = "feature-name-replacer";

Hooks.on("init", () => {
	console.log("Feature Name Replacer | Initializing...");
});


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

async function detectNamedCreatureOption(args, html) {
	if (html.find('input[name="namedCreature"]')[0].checked) {
		await args.object.setFlag(moduleName, "namedCreature", true);
	} else {
		await args.object.setFlag(moduleName, "namedCreature", false);
	}
}

Hooks.on("createItem", async (item) => {
	await replaceMonsterName(item);
});

Hooks.on("renderActorTypeConfig", async (args, html) => {
	await injectNamedCreatureOption(args, html);
});

Hooks.on("closeActorTypeConfig", async (args, html) => {
	await detectNamedCreatureOption(args, html);
});