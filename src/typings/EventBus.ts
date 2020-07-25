export enum EVENT_TYPE {
  GAME_IS_LIVE = 'GAME_IS_LIVE',
  PLAYER_UPDATE = 'PLAYER_UPDATE',
  MERCHANTRY_UPDATE = 'MERCHANTRY_UPDATE',
  START_BATTLE = 'START_BATTLE',
  END_BATTLE = 'END_BATTLE',
  CARD_PLAY = 'CARD_PLAY',
  GAME_PHASE_UPDATE = 'GAME_PHASE_UPDATE'
}

export enum EVENT_SUBTYPE {
  PLAYER_SYNC = 'PLAYER_SYNC',
  PLAYER_CARDS_UPDATED = 'PLAYER_CARDS_UPDATED',
  PLAYER_GOLD_CHANGE = 'PLAYER_GOLD_CHANGE',

  MERCHANTRY_ACTIVATE = 'MERCHANTRY_ACTIVATE'
}
