const {
  Map,
  List,
  Set,
} = require('immutable');
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
  const boardKeysIter = board.keys();
  let tempUnit = boardKeysIter.next();
  let buffMap = Map({
    0: Map({}),
    1: Map({}),
  });
  let unique = Map({
    0: Set([]),
    1: Set([]),
  });
  while (!tempUnit.done) {
    const unitPos = tempUnit.value;
    const unit = board.get(unitPos);
    const name = unit.get('name');
    // console.log('@countUnique UNIT', name)
    const team = unit.get('team') || teamParam;
    // console.log(unique, team, unit, unitPos)
    // console.log('@countUniqueOccurences', unique.get(String(team)), pawns.getBaseMonster(name))
    const basePokemon = await pawns.getBaseMonster(name);
    if (!unique.get(String(team)).has(basePokemon)) { // TODO: Check
      // f.p('@CountUniqueOccurences Unique', basePokemon, team, unique);
      const newSet = await unique.get(String(team)).add(basePokemon);
      unique = await unique.set(String(team), newSet); // Store unique version, only count each once
      const types = unit.get('type'); // Value or List
      if (!f.isUndefined(types.size)) { // List
        for (let i = 0; i < types.size; i++) {
          buffMap = buffMap.setIn([String(team), types.get(i)], (buffMap.getIn([String(team), types.get(i)]) || 0) + 1);
        }
      } else { // Value
        buffMap = buffMap.setIn([String(team), types], (buffMap.getIn([String(team), types]) || 0) + 1);
        // console.log('adding type occurence', name, team, buffMap.getIn([String(team), types]))
      }
    }
    tempUnit = boardKeysIter.next();
  }
  f.p('@CountUniqueOccurences', unique);
  return buffMap;
}

/**
 * Checks all units on board for player of that piece type
 * if 3 units are found, remove those 3 units and replace @ position with evolution
 * No units are added to discardedPieces
 */
async function _checkPieceUpgrade(stateParam, playerIndex, piece, position) {
  let state = stateParam;
  const boardUnits = state.getIn(['players', playerIndex, 'board']);
  const name = piece.get('name');
  const stats = await pawns.getStats(name);
  if (f.isUndefined(stats.get('evolves_to'))) {
    return Map({
      state,
      upgradeOccured: false,
    });
  }

  let pieceCounter = 0;
  let positions = List([]);
  const keysIter = boardUnits.keys();
  let tempUnit = keysIter.next();
  while (!tempUnit.done) {
    const unit = boardUnits.get(tempUnit.value);
    if (unit.get('name') === name) {
      pieceCounter += 1;
      positions = positions.push(unit.get('position'));
      // TODO: Check for bug buff here (baby pkmns)
    }
    tempUnit = keysIter.next();
  }
  let requiredAmount = 3;
  if (piece.get('reqEvolve')) {
    requiredAmount = piece.get('reqEvolve');
    console.log('LESS UNITS REQUIRED FOR UPGRADE', piece.get('name'), requiredAmount);
  }
  if (pieceCounter >= requiredAmount) { // Upgrade unit @ position
    // console.log('UPGRADING UNIT', name);
    let board = state.getIn(['players', playerIndex, 'board']);
    let discPieces = state.get('discardedPieces');
    for (let i = 0; i < positions.size; i++) {
      const unit = board.get(positions.get(i));
      discPieces = discPieces.push(unit.get('name'));
      board = board.delete(positions.get(i));
    }
    state = state.set('discardedPieces', discPieces);
    state = state.setIn(['players', playerIndex, 'board'], board);
    const evolvesUnit = stats.get('evolves_to');
    let evolvesTo = evolvesUnit;
    if (!f.isUndefined(evolvesTo.size)) { // List
      evolvesTo = evolvesUnit.get(f.getRandomInt(evolvesTo.size));
    }
    // Check if multiple evolutions exist, random between
    const newPiece = await BoardJS.getBoardUnit(evolvesTo, f.x(position), f.y(position));
    state = state.setIn(['players', playerIndex, 'board', position], newPiece);
    // TODO: List -> handle differently
    const evolutionDisplayName = (await pawns.getStats(evolvesTo)).get('displayName');
    // console.log('evolutionDisplayName', evolutionDisplayName);
    const nextPieceUpgrade = await _checkPieceUpgrade(state, playerIndex, newPiece, position);
    // Get both upgrades
    return nextPieceUpgrade.set('upgradeOccured', List([evolutionDisplayName]).concat(nextPieceUpgrade.get('upgradeOccured') || List([])));
  }
  return Map({
    state,
    upgradeOccured: false
  });
}

/** Public methods */

/**
 * Create unit for board/hand placement from name and spawn position
 */
BoardJS.getBoardUnit = async (name, x, y) => {
  const unitInfo = await pawns.getStats(name);
  if (f.isUndefined(unitInfo)) console.log('UNDEFINED:', name);
  // console.log('@getBoardUnit', name, unitInfo)
  let unit = Map({
    name,
    displayName: unitInfo.get('displayName'),
    position: f.pos(x, y),
    type: unitInfo.get('type'),
  });
  if (unitInfo.get('reqEvolve')) {
    unit = unit.set('reqEvolve', unitInfo.get('reqEvolve'));
  }
  return unit;
};

/**
 * Give bonuses from types
 * Type bonus is either only for those of that type or all units
 */
BoardJS.markBoardBonuses = async (board, teamParam = '0') => {
  const buffMap = await _countUniqueOccurences(board);

  // Map({0: Map({grass: 40})})
  let typeBuffMapSolo = Map({
    0: Map({}),
    1: Map({})
  }); // Solo buffs, only for that type
  let typeBuffMapAll = Map({
    0: Map({}),
    1: Map({})
  }); // For all buff
  let typeDebuffMapEnemy = Map({
    0: Map({}),
    1: Map({})
  }); // For all enemies debuffs
  // Find if any bonuses need applying
  for (let i = 0; i <= 1; i++) {
    const buffsKeysIter = buffMap.get(String(i)).keys();
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
                .setIn([String(i), buff, 'value'], (typeBuffMapSolo.get(String(i)).get(buff) ? typeBuffMapSolo.get(String(i)).get(buff).get('value') : 0) + typesJS.getBonusAmount(buff, j))
                .setIn([String(i), buff, 'typeBuff'], typesJS.getBonusStatType(buff))
                .setIn([String(i), buff, 'tier'], j);
              break;
            case 'allBonus':
              typeBuffMapAll = typeBuffMapAll
                .setIn([String(i), buff, 'value'], (typeBuffMapAll.get(String(i)).get(buff) ? typeBuffMapAll.get(String(i)).get(buff).get('value') : 0) + typesJS.getBonusAmount(buff, j))
                .setIn([String(i), buff, 'typeBuff'], typesJS.getBonusStatType(buff))
                .setIn([String(i), buff, 'tier'], j);
              break;
            case 'enemyDebuff':
              typeDebuffMapEnemy = typeDebuffMapEnemy
                .setIn([String(i), buff, 'value'], (typeDebuffMapEnemy.get(String(i)).get(buff) ? typeDebuffMapEnemy.get(String(i)).get(buff).get('value') : 0) + typesJS.getBonusAmount(buff, j))
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
          const bonusValue = typeBuffMapSolo.get(String(team)).get(types.get(i)).get('value');
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
      const bonusValue = typeBuffMapSolo.get(String(team)).get(types).get('value');
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
      const bonusValue = typeBuffMapAll.get(String(team)).get(buff).get('value');
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
      const bonusValue = typeDebuffMapEnemy.get(String(enemyTeam)).get(buff).get('value');
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
  }
  // console.log('NEWBOARD: ', newBoard);
  return Map({
    newBoard,
    buffMap,
    typeBuffMapSolo,
    typeBuffMapAll,
    typeDebuffMapEnemy,
  });
};

/**
 * Create unit for board battle from createBoardUnit unit given newpos/pos and team
 */
BoardJS.createBattleUnit = async (unit, unitPos, team) => {
  const unitStats = await pawns.getStats(unit.get('name'));
  const ability = await abilitiesJS.getAbility(unit.get('name'));
  // if(ability.get('mana')) console.log('@createBattleUnit', unit.get('name'), unitStats.get('ability'), ability.get('mana'));
  return unit.set('team', team).set('attack', unitStats.get('attack'))
    .set('hp', unitStats.get('hp'))
    .set('maxHp', unitStats.get('hp'))
    .set('startHp', unitStats.get('hp'))
    .set('type', unitStats.get('type'))
    .set('next_move', unitStats.get('next_move') || pawns.getStatsDefault('next_move'))
    .set('mana', unitStats.get('mana') || pawns.getStatsDefault('mana'))
    .set('ability', unitStats.get('ability'))
    .set('defense', unitStats.get('defense') || pawns.getStatsDefault('defense'))
    .set('speed', pawns.getStatsDefault('upperLimitSpeed') - (unitStats.get('speed') || pawns.getStatsDefault('speed')))
    /* .set('mana_hit_given', unitStats.get('mana_hit_given') || pawns.getStatsDefault('mana_hit_given'))
    .set('mana_hit_taken', unitStats.get('mana_hit_taken') || pawns.getStatsDefault('mana_hit_taken')) */
    .set('mana_multiplier', unitStats.get('mana_multiplier') || pawns.getStatsDefault('mana_multiplier'))
    .set('specialAttack', unitStats.get('specialAttack'))
    .set('specialDefense', unitStats.get('specialDefense'))
    .set('position', unitPos)
    .set('range', unitStats.get('range') || pawns.getStatsDefault('range'))
    .set('manaCost', ability.get('mana') || abilitiesJS.getDefault('mana'));
};

/**
 * Combines two boards into one for battle
 * Adds all relevant stats for the unit to the unit
 * Reverses position for enemy units
 */
BoardJS.combineBoards = async (board1, board2) => {
  const keysIter = board1.keys();
  let tempUnit = keysIter.next();
  let newBoard = Map({});
  while (!tempUnit.done) {
    const unitPos = tempUnit.value;
    const unit = board1.get(unitPos);
    const battleUnit = await BoardJS.createBattleUnit(unit, unitPos, 0);
    newBoard = await newBoard.set(unitPos, battleUnit);
    tempUnit = keysIter.next();
  }
  const keysIter2 = board2.keys();
  tempUnit = keysIter2.next();
  while (!tempUnit.done) {
    const unitPos = tempUnit.value;
    const newUnitPos = f.reverseUnitPos(unitPos); // Reverse unitPos
    const unit = board2.get(unitPos);
    const battleUnit = await BoardJS.createBattleUnit(unit, newUnitPos, 1);
    newBoard = await newBoard.set(newUnitPos, battleUnit);
    tempUnit = keysIter2.next();
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
BoardJS.placePiece = async (stateParam, playerIndex, fromPosition, toPosition, shouldSwap = 'true') => {
  let piece;
  let state = stateParam;
  if (f.checkHandUnit(fromPosition)) { // from hand
    // console.log('@placePiece placeOnBoard', fromPosition, state.getIn(['players', playerIndex, 'hand']));
    piece = state.getIn(['players', playerIndex, 'hand', fromPosition]).set('position', toPosition);
    const newHand = state.getIn(['players', playerIndex, 'hand']).delete(fromPosition);
    state = state.setIn(['players', playerIndex, 'hand'], newHand);
  } else { // from board
    // console.log('@placePiece', fromPosition);
    // console.log('@placePiece board', state.getIn(['players', playerIndex, 'board']));
    piece = state.getIn(['players', playerIndex, 'board', fromPosition]).set('position', toPosition);
    const newBoard = state.getIn(['players', playerIndex, 'board']).delete(fromPosition);
    state = state.setIn(['players', playerIndex, 'board'], newBoard);
  }
  let newPiece;
  if (f.checkHandUnit(toPosition)) { // to hand
    newPiece = state.getIn(['players', playerIndex, 'hand', toPosition]);
    state = state.setIn(['players', playerIndex, 'hand', toPosition], piece);
  } else { // to board
    newPiece = state.getIn(['players', playerIndex, 'board', toPosition]);
    state = state.setIn(['players', playerIndex, 'board', toPosition], piece);
  }
  if (shouldSwap && !f.isUndefined(newPiece)) { // Swap allowed
    if (f.checkHandUnit(fromPosition)) { // Swap newPiece to hand
      state = state.setIn(['players', playerIndex, 'hand', fromPosition], newPiece.set('position', fromPosition));
    } else { // Swap newPiece to board
      state = state.setIn(['players', playerIndex, 'board', fromPosition], newPiece.set('position', fromPosition));
    }
  }
  // console.log(state.getIn(['players', playerIndex, 'board']));
  const tempMarkedResults = await BoardJS.markBoardBonuses(state.getIn(['players', playerIndex, 'board']));
  const tempBoard = tempMarkedResults.get('newBoard');
  let upgradeOccured = false;
  if (!f.checkHandUnit(toPosition)) {
    const obj = await _checkPieceUpgrade(state.setIn(['players', playerIndex, 'board'], tempBoard), playerIndex, tempBoard.get(toPosition), toPosition);
    state = obj.get('state');
    upgradeOccured = obj.get('upgradeOccured');
  }
  if (shouldSwap && !f.isUndefined(newPiece) && !f.checkHandUnit(fromPosition)) {
    const obj = await _checkPieceUpgrade(state.setIn(['players', playerIndex, 'board'], tempBoard), playerIndex, tempBoard.get(fromPosition), fromPosition);
    state = obj.get('state');
    upgradeOccured = obj.get('upgradeOccured') || upgradeOccured;
  }
  const markedResults = await BoardJS.markBoardBonuses(state.getIn(['players', playerIndex, 'board']));
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
  state = state.setIn(['players', playerIndex, 'boardBuffs'], boardBuffs);
  const markedBoard = markedResults.get('newBoard');
  state = state.setIn(['players', playerIndex, 'board'], markedBoard);
  return Map({
    state,
    upgradeOccured
  });
};


/**
 * When units are sold, when level 1, a level 1 unit should be added to discardedPieces
 * Level 2 => 3 level 1 units, Level 3 => 9 level 1 units
 */
BoardJS.discardBaseUnits = async (stateParam, playerIndex, name, depth = 1) => {
  let state = stateParam;
  const unitStats = await pawns.getStats(name);
  const evolutionFrom = unitStats.get('evolves_from');
  // console.log('@discardBaseUnits start', name, depth);
  if (f.isUndefined(evolutionFrom)) { // Base level
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
    return state.set('discardedPieces', (await discPieces));
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
  if (f.checkHandUnit(piecePosition)) {
    pieceTemp = state.getIn(['players', playerIndex, 'hand', piecePosition]);
  } else {
    pieceTemp = state.getIn(['players', playerIndex, 'board', piecePosition]);
  }
  const piece = pieceTemp;
  const unitStats = await pawns.getStats(piece.get('name'));
  const cost = unitStats.get('cost');
  const gold = state.getIn(['players', playerIndex, 'gold']);
  let newState = state.setIn(['players', playerIndex, 'gold'], +gold + +cost);
  if (f.checkHandUnit(piecePosition)) {
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
BoardJS.createBattleBoard = async (inputList) => {
  let board = Map({});
  for (let i = 0; i < inputList.size; i++) {
    const el = inputList.get(i);
    const pokemon = el.get('name');
    const x = el.get('x');
    const y = el.get('y');
    const unit = await BoardJS.getBoardUnit(pokemon, x, y);
    board = await board.set(f.pos(x, y), unit);
  }
  return board;
};

/**
 * Returns position of unit with the next move
 */
BoardJS.getUnitWithNextMove = async (board) => {
  // console.log('@getUnitWithNextMove',board)
  const boardKeysIter = board.keys();
  let tempUnit = boardKeysIter.next();
  let lowestNextMove = List([tempUnit.value]);
  let lowestNextMoveValue = board.get(tempUnit.value).get('next_move');
  while (!tempUnit.done) {
    const unitPos = tempUnit.value;
    const unitNextMove = board.get(unitPos).get('next_move');
    if (unitNextMove < lowestNextMoveValue) { // New lowest move
      lowestNextMove = List([unitPos]);
      lowestNextMoveValue = unitNextMove;
    } else if (unitNextMove === lowestNextMoveValue) {
      lowestNextMove = lowestNextMove.push(unitPos);
    }
    tempUnit = boardKeysIter.next();
  }
  // Find nextMove unit
  if (lowestNextMove.size === 1) {
    if (f.isUndefined(lowestNextMove.get(0))) {
      console.log('@getUnitWithNextMove Undefined', board);
    }
    return lowestNextMove.get(0);
  }
  // Decide order of equal next move units
  // Approved Temp: Random order
  return lowestNextMove.get(Math.floor(Math.random() * lowestNextMove.size));
};

module.exports = BoardJS;
