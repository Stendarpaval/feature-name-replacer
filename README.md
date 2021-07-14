# Feature Name Replacer
 A Foundry VTT module for the dnd5e system that replaces the names in curly brackets of Monster Features.
 
 
## How to install
Copy and paste this manifest url into Foundry's package browser to download and then install this module: `https://raw.githubusercontent.com/Stendarpaval/feature-name-replacer/main/module.json`

## What it does
As you might know, the [dnd5e system](https://gitlab.com/foundrynet/dnd5e) offers a compendium of Monster Features that is intended to allow you to quickly drag and drop features onto monster actor sheets to change or create custom monsters. However, in the description text you'll frequently come across monster name stand-ins such as `{creature}` or `{type}`. Currently you'd have to manually edit the description text to replace these words with the correct names, which can be a tedious task. 

However, this module will handle that tedious task for you! It automatically replaces the words "creature" and "type" enclosed in curly brackets when you drop features from the Monster Features (SRD) compendium onto a character sheet. 

It also introduces a "Named Creature" option in the ActorTypeConfig application of NPC actors (see the video below). Not only does this preserve any capital letters in the monster's name, but it also removes any superfluous preceding articles (like "The" or "the").

https://user-images.githubusercontent.com/17188192/125627252-7559a112-4d1e-4f75-af98-94a3591dafc1.mp4
