# Feature Name Replacer
 A system agnostic module for Foundry VTT that replaces user specified keywords in the descriptions of items added to actor sheets.
 
## How to install
Search Foundry's package browser for "Feature Name Replacer", or copy and paste this manifest url into the package browser's manifest text field to download and then install this module: `https://raw.githubusercontent.com/Stendarpaval/feature-name-replacer/main/module.json`

## What it does
As you might know, the [dnd5e system](https://gitlab.com/foundrynet/dnd5e) offers a compendium of Monster Features that is intended to allow you to quickly drag and drop features onto monster actor sheets to change or create custom monsters. However, in the description text you'll frequently come across monster name stand-ins such as `{creature}` or `{type}`. Currently you'd have to manually edit the description text to replace these words with the correct names, which can be a tedious task. 

However, this module will handle that tedious task for you! It can automatically replace the words "creature" and "type" enclosed in curly brackets when you drop any item on actor sheets. Or any keywords, actually. This is not dnd5e specific, so if you use a different system that has keywords you'd like to replace, then this module will do that for you. See the screenshot of the module's Keyword Settings below to get an idea for how that'd work.

<img width="557" alt="FNR-v0 2 0-screenshot-1" src="https://user-images.githubusercontent.com/17188192/125860372-9816af57-6ff2-49ae-8d51-89a16c3a61e0.png">

For the dnd5e system, this module also introduces a "Named Creature" option in the ActorTypeConfig application of NPC actors (see the video below). Not only does this preserve any capitalized letters in the monster's name, but it also removes any preceding articles (like "The" or "the"). The module settings allow you to manually specify "Named Creatures", for game systems other than dnd5e.

<details>
 <summary>Click here to show a video of FNR v0.1.0</summary>
 
 https://user-images.githubusercontent.com/17188192/125627252-7559a112-4d1e-4f75-af98-94a3591dafc1.mp4
</details>

As of v0.2.0, you can not only specify keywords, but also what they should be replaced with using the Keyword Settings. An example is shown below.

<details>
 <summary>Click here to show a video of FNR v0.2.0</summary>

 https://user-images.githubusercontent.com/17188192/125860036-82a97c24-de55-481c-8a24-5d570e518578.mp4
</details>
