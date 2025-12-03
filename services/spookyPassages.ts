// Spooky Halloween text passages for typing test
export const SPOOKY_PASSAGES: string[] = [
  "The ghost whispered behind you as the candles flickered in the darkness of the abandoned mansion",
  "The pumpkin cracked open revealing a swarm of spiders crawling toward the moonlit graveyard",
  "Shadows danced on the walls as the witch stirred her bubbling cauldron under the blood moon",
  "The skeleton rose from its grave reaching bony fingers toward the terrified villagers",
  "Bats flew from the haunted tower as thunder echoed through the cursed forest",
  "The vampire emerged from his coffin hungry for blood on this Halloween night",
  "Cobwebs covered the ancient doorway where no living soul had entered for centuries",
  "The werewolf howled at the full moon transforming under the eerie silver light",
  "Ghosts floated through the cemetery walls searching for lost souls to join them",
  "The haunted doll opened its eyes watching you from the dusty corner of the attic",
  "Zombies shuffled through the fog their moans echoing in the silent night",
  "The black cat crossed your path as lightning struck the old church steeple",
  "Screams echoed from the abandoned asylum where dark experiments once took place",
  "The mummy unwrapped itself from ancient bandages awakening after a thousand years",
  "Crows gathered on the dead tree watching with knowing eyes as darkness fell",
  "The demon emerged from the portal drawn by the forbidden ritual performed at midnight",
  "Chains rattled in the dungeon where prisoners had been forgotten long ago",
  "The scarecrow turned its head following you with hollow button eyes",
  "Fog rolled through the graveyard obscuring the names on weathered tombstones",
  "The mirror showed a reflection that was not your own smiling back wickedly",
  "Whispers filled the empty hallway speaking secrets of those who died here",
  "The jack o lantern grinned with flickering flames as trick or treaters approached",
  "Something scratched at the window but nothing was there when you looked outside",
  "The old grandfather clock struck thirteen times announcing the witching hour",
  "Bones crunched underfoot as you walked through the monsters hidden lair",
  "The cauldron bubbled with a mysterious green potion that glowed in the dark",
  "Spiders descended from the ceiling spinning webs around the sleeping victim",
  "The phantom played a haunting melody on the dusty pipe organ",
  "Eyes watched from the darkness waiting for you to let your guard down",
  "The curse was spoken and the village was never the same again",
  "Tombstones cracked as the undead clawed their way back to the surface",
  "The witch cackled flying across the orange harvest moon on her broomstick",
  "Something lurked beneath the bed waiting for the lights to go out",
  "The haunted house groaned and creaked as if it were alive and breathing",
  "Candles blew out one by one leaving you alone in complete darkness",
  "The monster under the stairs had been patient for far too long",
  "Bloody footprints led down the corridor disappearing into the shadows",
  "The possessed child spoke in tongues warning of the coming apocalypse",
  "Gravestones bore the names of those who dared enter this cursed place",
  "The reaper appeared at the crossroads offering a deal for your soul"
];

export const getRandomSpookyPassage = (): string => {
  const randomIndex = Math.floor(Math.random() * SPOOKY_PASSAGES.length);
  return SPOOKY_PASSAGES[randomIndex];
};

export const generateSpookyText = (wordCount: number): string => {
  let result: string[] = [];
  let currentCount = 0;
  
  while (currentCount < wordCount) {
    const passage = getRandomSpookyPassage();
    const words = passage.split(' ');
    result = result.concat(words);
    currentCount = result.length;
  }
  
  return result.slice(0, wordCount).join(' ');
};
