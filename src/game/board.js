const _ = require('lodash');
const f = require('../f');
const pawns = require('../pawns');
const abilitiesJS = require('../abilities');
const typesJS = require('../types');

const BoardJS = {};

/** Private methods */

/**
 * Counts unique occurences of piece on board connected to each team
 * Puts them in a map and returns it
 * Map({0: Map({grass: 3, fire: 2}), 1: Map({normal: 5})})
 * Set(['pikachu']) (no more pikachus or raichus)
 */
async function _countUniqueOccurences(board, teamParam = '0') {
  const buffMap = {
    0: {},
    1: {}
  };
  const unique = {
    0: [],
    1: []
  };

  const keys = Object.keys(board);
  for (let index = 0; index < keys.length; index++) {
    const unitPos = keys[index];
    const unit = board[unitPos];
    const team = unit['team'] || teamParam;
    const name = unit['name'];
    const baseMonser = await pawns.getBaseMonster(name);

    if (!unique[String(team)].includes(name)) {
      // TODO: Check
      f.p('@CountUniqueOccurences Unique', baseMonser, team, unique);
      const newSet = unique[String(team)].push(baseMonser);
      unique[String(team)] = newSet; // Store unique version, only count each once
      const types = unit['type']; // Value or List
      if (!f.isUndefined(types.size)) {
        // List
        for (let i = 0; i < types.size; i++) {
          buffMap[String(team)][types[i]] = (buffMap[String(team)][types[i]] || 0) + 1;
        }
      } else {
        // Value
        buffMap[String(team)][types] = (buffMap[String(team)][types] || 0) + 1;
        console.log('adding type occurence', name, team, buffMap[String(team)][types]);
      }
    }
  }

  f.p('@CountUniqueOccurences', unique);
  return buffMap;
}

/**
 * Checks all units on board for player of that piece type
 * if 3 units are found, remove those 3 units and replace @ position with evolution
 * No units are added to discardedPieces
 */
async function _checkPieceUpgrade(board, playerIndex, piece, position) {
  const name = piece['name'];
  const stats = pawns.getMonsterStats(name);
  if (f.isUndefined(stats['evolves_to'])) {
    return {
      board,
      upgradeOccured: false
    };
  }

  let pieceCounter = 0;
  const positions = [];

  const takenPositions = Object.keys(board);
  for (let index = 0; index < takenPositions.length; index++) {
    const key = takenPositions[index];
    const unit = board[key];
    if (unit['name'] === name) {
      pieceCounter += 1;
      positions.push(unit.position);
    }
  }

  let requiredAmount = 3;
  if (piece['reqEvolve']) {
    requiredAmount = piece['reqEvolve'];
    console.log('LESS UNITS REQUIRED FOR UPGRADE', piece['name'], requiredAmount);
  }
  if (pieceCounter >= requiredAmount) {
    // Upgrade unit @ position
    // console.log('UPGRADING UNIT', name);
    // let discPieces = state.get('discardedPieces'); // TODO discardedPieces???
    for (let i = 0; i < positions.size; i++) {
      const unit = board[positions[i]];
      // discPieces = discPieces.push(unit['name']);
      delete board[positions[i]];
    }
    // state = state.set('discardedPieces', discPieces);
    const evolvesUnit = stats['evolves_to'];
    let evolvesTo = evolvesUnit;
    if (!f.isUndefined(evolvesTo.length)) {
      // List
      evolvesTo = evolvesUnit[f.getRandomInt(evolvesTo.length)];
    }
    // Check if multiple evolutions exist, random between
    const newPiece = BoardJS.getBoardUnit(evolvesTo); // not needed I guess
    // TODO: List -> handle differently
    const evolutionDisplayName = pawns.getMonsterStats(evolvesTo).get('displayName');
    // console.log('evolutionDisplayName', evolutionDisplayName);
    const nextPieceUpgrade = await _checkPieceUpgrade(board, playerIndex, newPiece, position);
    // Get both upgrades
    // TODO
    return nextPieceUpgrade.set('upgradeOccured', [evolutionDisplayName]).concat(nextPieceUpgrade.get('upgradeOccured') || []);
  }
  return {
    board,
    upgradeOccured: false
  };
}

/** Public methods */

/**
 * Create unit for board/hand placement from name and spawn position
 */
BoardJS.getBoardUnit = name => {
  const unitInfo = pawns.getMonsterStats(name); // this may be a overuse. Maybe units should be always Uni
  if (f.isUndefined(unitInfo)) console.log('UNDEFINED:', name);
  // console.log('@getBoardUnit', name, unitInfo)
  return unitInfo;
};

/**
 * Give bonuses from types
 * Type bonus is either only for those of that type or all units
 */
BoardJS.markBoardBonuses = async (board, teamParam = '0') => {
  const buffMap = await _countUniqueOccurences(board);

  // Map({0: Map({grass: 40})})
  const typeBuffMapSolo = {
    0: {},
    1: {}
  }; // Solo buffs, only for that type
  const typeBuffMapAll = {
    0: {},
    1: {}
  }; // For all buff
  const typeDebuffMapEnemy = {
    0: {},
    1: {}
  }; // For all enemies debuffs
  // Find if any bonuses need applying
  // TODO
  /* for (let i = 0; i <= 1; i++) {
    const buffsKeysIter = Object.keys();
    let tempBuff = buffsKeysIter.next();
    while (!tempBuff.done) {
      const buff = tempBuff.value;
      const amountBuff = buffMap.get(String(i)).get(buff);
      for (let j = 1; j <= 3; j++) {
        if (typesJS.hasBonus(buff) && amountBuff >= typesJS.getTypeReq(buff, j)) {
          // console.log('@markBoardBonuses', amountBuff, typesJS.getTypeReq(buff, i))
          switch (typesJS.getBonusType(buff)) {
            case 'bonus':
              typeBuffMapSolo = typeBuffMapSolo
                .setIn([String(i), buff, 'value'], (typeBuffMapSolo.get(String(i)).get(buff) ? typeBuffMapSolo.get(String(i)).get(buff)['value'] : 0) + typesJS.getBonusAmount(buff, j))
                .setIn([String(i), buff, 'typeBuff'], typesJS.getBonusStatType(buff))
                .setIn([String(i), buff, 'tier'], j);
              break;
            case 'allBonus':
              typeBuffMapAll = typeBuffMapAll
                .setIn([String(i), buff, 'value'], (typeBuffMapAll.get(String(i)).get(buff) ? typeBuffMapAll.get(String(i)).get(buff)['value'] : 0) + typesJS.getBonusAmount(buff, j))
                .setIn([String(i), buff, 'typeBuff'], typesJS.getBonusStatType(buff))
                .setIn([String(i), buff, 'tier'], j);
              break;
            case 'enemyDebuff':
              typeDebuffMapEnemy = typeDebuffMapEnemy
                .setIn([String(i), buff, 'value'], (typeDebuffMapEnemy.get(String(i)).get(buff) ? typeDebuffMapEnemy.get(String(i)).get(buff)['value'] : 0) + typesJS.getBonusAmount(buff, j))
                .setIn([String(i), buff, 'typeBuff'], typesJS.getBonusStatType(buff))
                .setIn([String(i), buff, 'tier'], j);
              break;
            case 'noBattleBonus':
              // No impact in battle
              break;
            default:
              console.log(`Ability bonus type error ... Error found for ${typesJS.getBonusType(buff)}`);
              process.exit();
          }
        } else {
          break;
        }
      }
      tempBuff = buffsKeysIter.next();
    }
  }

  // Apply buff
  const boardKeysIter = board.keys();
  let tempUnit = boardKeysIter.next();
  let newBoard = board;
  while (!tempUnit.done) {
    const unitPos = tempUnit.value;
    const unit = board.get(unitPos);
    newBoard = newBoard.setIn([unitPos, 'buff'], List([]));
    const team = unit.get('team') || teamParam;
    // Solo buffs
    const types = board.get(unitPos).get('type'); // Value or List
    if (!f.isUndefined(types.size)) { // List
      let newUnit = unit;
      for (let i = 0; i < types.size; i++) {
        if (!f.isUndefined(typeBuffMapSolo.get(String(team)).get(types.get(i)))) {
          // console.log('@markBoardBonuses Marking unit', newUnit.get('name'));
          const buff = typesJS.getType(types.get(i));
          const buffName = buff.get('name');
          const bonusValue = typeBuffMapSolo.get(String(team)).get(types.get(i))['value'];
          const bonusType = buff.get('bonusStatType');
          const buffTextContent = (bonusType.includes('unique') ? bonusType.split('_')[1] + bonusValue : `${bonusType} +${bonusValue}`);
          const buffText = `${buffName}: ${buffTextContent}`;
          newUnit = (await typesJS.getBuffFuncSolo(types.get(i))(newUnit, bonusValue))
            .set('buff', (newBoard.get(unitPos).get('buff') || List([])).push(buffText)); // Add buff to unit
          newBoard = await newBoard.set(unitPos, newUnit);
        }
      }
    } else if (!f.isUndefined(typeBuffMapSolo.get(String(team)).get(types))) {
      // console.log('@markBoardBonuses Marking unit', unit.get('name'));
      const buff = typesJS.getType(types);
      const buffName = buff.get('name');
      const bonusValue = typeBuffMapSolo.get(String(team)).get(types)['value'];
      const bonusType = buff.get('bonusStatType');
      const buffTextContent = (bonusType.includes('unique') ? bonusType.split('_')[1] + bonusValue : `${bonusType} +${bonusValue}`);
      const buffText = `${buffName}: ${buffTextContent}`;
      const newUnit = (await typesJS.getBuffFuncSolo(types)(unit, bonusValue))
        .set('buff', (newBoard.get(unitPos).get('buff') || List([])).push(buffText)); // Add buff to unit
      newBoard = await newBoard.set(unitPos, newUnit);
    }

    // All buffs
    const allBuffIter = typeBuffMapAll.get(String(team)).keys();
    let tempBuffAll = allBuffIter.next();
    while (!tempBuffAll.done) {
      const buff = tempBuffAll.value;
      const bonusValue = typeBuffMapAll.get(String(team)).get(buff)['value'];
      const bonusType = typesJS.getBonusStatType(buff);
      const buffText = `${buff}: ${bonusType} +${bonusValue}`;
      const newUnit = typesJS.getBuffFuncAll(buff)(newBoard.get(unitPos), bonusValue)
        .set('buff', (newBoard.get(unitPos).get('buff') || List([])).push(buffText));
      newBoard = await newBoard.set(unitPos, newUnit);
      tempBuffAll = allBuffIter.next();
    }

    // Enemy buffs
    const enemyTeam = 1 - team;
    const enemyDebuffIter = typeDebuffMapEnemy.get(String(enemyTeam)).keys();
    let tempEnemy = enemyDebuffIter.next();
    while (!tempEnemy.done) {
      const buff = tempEnemy.value;
      const bonusValue = typeDebuffMapEnemy.get(String(enemyTeam)).get(buff)['value'];
      const bonusType = typesJS.getBonusStatType(buff);
      const buffText = `${buff}: ${bonusType} +${bonusValue}`;
      const newUnit = typesJS.getEnemyDebuff(buff)(newBoard.get(unitPos), bonusValue)
        .set('buff', (newBoard.get(unitPos).get('buff') || List([])).push(buffText));
      newBoard = await newBoard.set(unitPos, newUnit);
      tempEnemy = enemyDebuffIter.next();
    }
    tempUnit = boardKeysIter.next();
  }
  if (f.isUndefined(newBoard) || Object.keys(newBoard).length === 0) {
    console.log('@markBoardBonuses CHECK ME', newBoard);
  } */
  // console.log('NEWBOARD: ', newBoard);
  return {
    board,
    buffMap,
    typeBuffMapSolo,
    typeBuffMapAll,
    typeDebuffMapEnemy
  };
};

/**
 * Create unit for board battle from createBoardUnit unit given newpos/pos and team
 * @TODO maybe we need to use BattleUnit class here instead -.- !!!
 */
BoardJS.createBattleUnit = async (unit, unitPos, team) => {
  const unitStats = pawns.getMonsterStats(unit['name']);
  const ability = await abilitiesJS.getAbility(unit['name']);

  const battleUnit = _.cloneDeep(unit);
  // todo proper way :)
  unitStats.get = field => unitStats[field];
  const set = (where, what) => {
    battleUnit[where] = what;
    return this;
  };

  set('_uid', unitPos); // this is hack for BattleUnit functionality which is required on front.

  set('team', team);
  set('attack', unitStats.get('attack'));
  set('hp', unitStats['hp']);
  set('maxHp', unitStats['hp']);
  set('startHp', unitStats['hp']);
  set('type', unitStats.get('type'));
  set('next_move', unitStats.get('next_move') || pawns.getStatsDefault('next_move'));
  set('mana', unitStats['mana'] || pawns.getStatsDefault('mana'));
  set('ability', unitStats.get('ability'));
  set('defense', unitStats.get('defense') || pawns.getStatsDefault('defense'));
  set('speed', unitStats.get('speed'));
  /* .set('mana_hit_given', unitStats.get('mana_hit_given') || pawns.getStatsDefault('mana_hit_given'))
  set('mana_hit_taken', unitStats.get('mana_hit_taken') || pawns.getStatsDefault('mana_hit_taken')) */
  set('mana_multiplier', unitStats.get('mana_multiplier') || pawns.getStatsDefault('mana_multiplier'));
  set('specialAttack', unitStats.get('specialAttack'));
  set('specialDefense', unitStats.get('specialDefense'));
  set('position', unitPos); // its not being updated on move, imho need BattleUnit usage here
  set('range', unitStats.get('range') || pawns.getStatsDefault('range'));
  set('manaCost', (ability && ability['mana']) || abilitiesJS.getDefault('mana'));

  return battleUnit;
};

/**
 * Combines two boards into one for battle
 * Adds all relevant stats for the unit to the unit
 * Reverses position for enemy units
 */
BoardJS.createBattleBoard = async (board1, board2) => {
  const newBoard = {};

  for (const unitPos in board1) {
    const unit = board1[unitPos];
    const battleUnit = await BoardJS.createBattleUnit(unit, unitPos, 0);
    newBoard[unitPos] = battleUnit;
  }

  for (const unitPos in board2) {
    const unit = board2[unitPos];
    const battleUnit = await BoardJS.createBattleUnit(unit, unitPos, 1);
    newBoard[unitPos] = battleUnit;
  }

  return newBoard;
};

/**
 * Get first available spot on hand
 */
BoardJS.getFirstAvailableSpot = async (state, playerIndex) => {
  const hand = state.getIn(['players', playerIndex, 'hand']);
  // console.log('@getFirst', hand.keys().value)
  for (let i = 0; i < 8; i++) {
    // Get first available spot on bench
    const pos = f.pos(i);
    // console.log('inner', hand.get(pos), hand.get(String(pos)))
    if (f.isUndefined(hand.get(pos)) && f.isUndefined(hand.get(String(pos)))) {
      return pos;
    }
  }
  // Returns undefined if hand is full
  return undefined;
};

/**
 * WithdrawPiece from board to best spot on bench
 * * Assumes not bench is full
 */
BoardJS.withdrawPiece = async (state, playerIndex, piecePosition) => {
  const benchPosition = await BoardJS.getFirstAvailableSpot(state, playerIndex);
  // TODO: Handle placePiece return upgradeOccured
  return (await BoardJS.placePiece(state, playerIndex, piecePosition, benchPosition, false)).get('state');
};

/**
 * Place piece
 * Swap functionality by default, if something is there already
 * * Assumes that only half of the board is placed on
 * TODO: Mark units to be sent back if too many
 *       Do buff calculations and mark on board
 *       Return if PieceUpgrade occured Map({state, upgradeOccured: true})
 */
BoardJS.mutateStateByPawnPlacing = async (state, playerIndex, fromPosition, toPosition, shouldSwap = 'true') => {
  const hand = state.getIn(['players', playerIndex, 'hand']);
  let board = state.getIn(['players', playerIndex, 'board']);

  let piece;
  // Update pawns positions and remove from old stores based on fromPosition
  if (f.isPositionBelongsToHand(fromPosition)) {
    piece = hand[fromPosition];
    hand[fromPosition].position = toPosition;
    delete hand[fromPosition];
  } else {
    piece = board[fromPosition];
    board[fromPosition].position = toPosition;
    delete board[fromPosition];
  }

  let newPiece;
  if (f.isPositionBelongsToHand(toPosition)) {
    newPiece = hand[toPosition];
    hand[toPosition] = piece;
  } else {
    newPiece = board[toPosition];
    board[toPosition] = piece;
  }

  if (shouldSwap && !f.isUndefined(newPiece)) {
    newPiece.position = fromPosition;

    if (f.isPositionBelongsToHand(fromPosition)) {
      hand[fromPosition] = newPiece;
    } else {
      board[fromPosition] = newPiece;
    }
  }

  // TODO
  // const tempMarkedResults = await BoardJS.markBoardBonuses(board);
  // const tempBoard = tempMarkedResults.get('newBoard');

  let upgradeOccured = false;
  if (!f.isPositionBelongsToHand(toPosition)) {
    const obj = await _checkPieceUpgrade(board, playerIndex, board[toPosition], toPosition);
    board = obj['board'];
    upgradeOccured = obj['upgradeOccured'];
  }

  if (shouldSwap && !f.isUndefined(newPiece) && !f.isPositionBelongsToHand(fromPosition)) {
    const obj = await _checkPieceUpgrade(board, playerIndex, board[fromPosition], fromPosition);
    board = obj['board'];
    upgradeOccured = obj['upgradeOccured'] || upgradeOccured;
  }

  /* const markedResults = await BoardJS.markBoardBonuses(board);
  const buffMap = markedResults.get('buffMap').get('0');
  const typeBuffMapSolo = markedResults.get('typeBuffMapSolo').get('0');
  const typeBuffMapAll = markedResults.get('typeBuffMapAll').get('0');
  const typeDebuffMapEnemy = markedResults.get('typeDebuffMapEnemy').get('0');
  // Add this information to the state, boardBuffs

  const boardBuffs = Map({
    buffMap,
    typeBuffMapSolo,
    typeBuffMapAll,
    typeDebuffMapEnemy,
  });
  // console.log('@boardBuffs', boardBuffs);
  state = state.setIn(['players', playerIndex, 'boardBuffs'], boardBuffs); */
  // const markedBoard = markedResults.get('newBoard');

  state.setIn(['players', playerIndex, 'hand'], hand);
  state.setIn(['players', playerIndex, 'board'], board);
  return {
    upgradeOccured
  };
};

/**
 * When units are sold, when level 1, a level 1 unit should be added to discardedPieces
 * Level 2 => 3 level 1 units, Level 3 => 9 level 1 units
 */
BoardJS.discardBaseUnits = async (stateParam, playerIndex, name, depth = 1) => {
  let state = stateParam;
  const unitStats = pawns.getMonsterStats(name);
  const evolutionFrom = unitStats.get('evolves_from');
  // console.log('@discardBaseUnits start', name, depth);
  if (f.isUndefined(evolutionFrom)) {
    // Base level
    let discPieces = state.get('discardedPieces');
    const amountOfPieces = 3 ** (depth - 1); // Math.pow
    console.log('@discardBaseUnits', amountOfPieces, depth, name);
    for (let i = 0; i < amountOfPieces; i++) {
      discPieces = discPieces.push(name);
    }
    const unitAmounts = state.getIn(['players', playerIndex, 'unitAmounts']);
    if (unitAmounts) {
      const newValue = unitAmounts.get(name) - amountOfPieces;
      if (newValue === 0) {
        state = state.setIn(['players', playerIndex, 'unitAmounts'], unitAmounts.delete(name));
      } else {
        state = state.setIn(['players', playerIndex, 'unitAmounts', name], newValue);
      }
    }
    return state.set('discardedPieces', await discPieces);
  }
  const newName = evolutionFrom;
  // console.log('@discardBaseUnits', newName, depth);
  return BoardJS.discardBaseUnits(state, playerIndex, newName, depth + 1);
};

/**
 * Sell piece
 * Increase money for player
 * Remove piece from position
 * add piece to discarded pieces
 */
BoardJS.sellPiece = async (state, playerIndex, piecePosition) => {
  let pieceTemp;
  if (f.isPositionBelongsToHand(piecePosition)) {
    pieceTemp = state.getIn(['players', playerIndex, 'hand', piecePosition]);
  } else {
    pieceTemp = state.getIn(['players', playerIndex, 'board', piecePosition]);
  }
  const piece = pieceTemp;
  const unitStats = pawns.getMonsterStats(piece.get('name'));
  const cost = unitStats.get('cost');
  const gold = state.getIn(['players', playerIndex, 'gold']);
  let newState = state.setIn(['players', playerIndex, 'gold'], +gold + +cost);
  if (f.isPositionBelongsToHand(piecePosition)) {
    const unitToSell = newState.getIn(['players', playerIndex, 'hand', piecePosition]);
    const newHand = newState.getIn(['players', playerIndex, 'hand']).delete(piecePosition);
    const newDiscardedPieces = newState.set('discardedPieces', newState.get('discardedPieces').push(unitToSell.get('name')));
    newState = newDiscardedPieces.setIn(['players', playerIndex, 'hand'], newHand);
  } else {
    const unitToSell = newState.getIn(['players', playerIndex, 'board', piecePosition]);
    const newBoard = newState.getIn(['players', playerIndex, 'board']).delete(piecePosition);
    const newDiscardedPieces = newState.set('discardedPieces', newState.get('discardedPieces').push(unitToSell.get('name')));
    newState = newDiscardedPieces.setIn(['players', playerIndex, 'board'], newBoard);
  }
  // Add units to discarded Cards, add base level of card
  return BoardJS.discardBaseUnits(newState, playerIndex, piece.get('name'));
};

/**
 * Help function in creating battle boards
 * Use together with combine boards
 */
BoardJS.createBoard = async inputList => {
  console.log('TCL: BoardJS.createBoard -> inputList', inputList);
  const board = {};
  for (let i = 0; i < inputList.length; i++) {
    const el = inputList[i];
    const unit = BoardJS.getBoardUnit(el['name']);
    board[f.pos(el.x, el.y)] = unit;
  }
  return board;
};

module.exports = BoardJS;
