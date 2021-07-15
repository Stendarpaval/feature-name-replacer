# Feature Name Replacer
 A system agnostic module for Foundry VTT that replaces the names in curly brackets of items added to actor sheets.
 
 
## How to install
Copy and paste this manifest url into Foundry's package browser to download and then install this module: `https://raw.githubusercontent.com/Stendarpaval/feature-name-replacer/main/module.json`

## What it does
As you might know, the [dnd5e system](https://gitlab.com/foundrynet/dnd5e) offers a compendium of Monster Features that is intended to allow you to quickly drag and drop features onto monster actor sheets to change or create custom monsters. However, in the description text you'll frequently come across monster name stand-ins such as `{creature}` or `{type}`. Currently you'd have to manually edit the description text to replace these words with the correct names, which can be a tedious task. 

However, this module will handle that tedious task for you! It automatically replaces the words "creature" and "type" enclosed in curly brackets when you drop any item on actor sheets. This is not dnd5e specific, so if you use a different system that has words in curly brackets you'd like to replace, then this module will do that for you. See the screenshot of the module's settings below to get an idea for how that'd work.

<img width="580" alt="feature-name-replacer-v0 1 0-screenshot-1" src="https://user-images.githubusercontent.com/17188192/125751272-6a25b45f-6cba-44a2-aa8a-4f3662ced896.png">

For the dnd5e system, this module also introduces a "Named Creature" option in the ActorTypeConfig application of NPC actors (see the video below). Not only does this preserve any capital letters in the monster's name, but it also removes any superfluous preceding articles (like "The" or "the").

https://user-images.githubusercontent.com/17188192/125627252-7559a112-4d1e-4f75-af98-94a3591dafc1.mp4
