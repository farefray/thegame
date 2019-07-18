

// TODO: Learn webpack

// Music
import pokemonCenter from './assets/Music/pokemonCenter.mp3';
import trainerBattle from './assets/Music/trainerBattle.mp3';
import rivalTheme from './assets/Music/rivalTheme.mp3';
import goldThemeOriginal from './assets/Music/goldThemeOriginal.mp3';
import gymVictoryTheme from './assets/Music/gymVictoryTheme.mp3';

// Sound Effects

import sellSound from './assets/SoundEffects/sellSound.mp3';
import cheer from './assets/SoundEffects/cheer.mp3';
import battleLose from './assets/SoundEffects/battleLose.mp3';
import lvlup from './assets/SoundEffects/lvlup.mp3';
import pling from './assets/SoundEffects/pling.mp3';
import invalid from './assets/SoundEffects/invalid.mp3';
import horn from './assets/SoundEffects/horn.mp3';
import heGone from './assets/SoundEffects/heGone.mp3';
import Tick from './assets/SoundEffects/Tick.mp3';

import minotaur from './assets/monsterssounds/monster.wav'


const array = [
  ['minotaur', minotaur] 
];

const map = new Map(array);

// TODO: Load this file dynamically, information stored in sheets

export function getUnitAudio(name) {
  // console.log('@getUnitAudio', name, map.get(name), cleffa, map);
  return map.get(name);
}

export function getBackgroundAudio(name) {
  switch(name) {
    case 'mainMenu':
      return goldThemeOriginal;
    case 'battle':
    case 'gymbattle':
    case 'pvpbattle':
      return trainerBattle;
    case 'rival':
      return rivalTheme;
    case 'wonGame':
      return gymVictoryTheme;
    case 'shop':
    case 'idle':
    default:  
      return pokemonCenter;
  }
}

export function getSoundEffect(name){
  switch(name){
    case 'sellUnit':
      return sellSound;
    case 'cheer':
      return cheer;
    case 'lvlup':
      return lvlup;
    case 'pling':
      return pling;
    case 'invalid':
      return invalid;
    case 'horn':
      return horn;
    case 'battleLose':
      return battleLose;
    case 'disconnect':
      return heGone;
    case 'Tick':
      return Tick;
    default:
      return undefined;
  }
}