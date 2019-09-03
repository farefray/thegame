UnitJS.getClosestEnemy = (board, unitPos, range, team, exceptionsList = []) => {
  const x = f.x(unitPos);
  const y = f.y(unitPos);
  const enemyTeam = 1 - team;
  let pos;
  // Check N S W E
  pos = f.pos(x, y + 1);
  if (!f.isUndefined(board[pos]) && board[pos]['team'] === enemyTeam && !exceptionsList.includes(pos)) {
    return { closestEnemy: pos, withinRange: true, direction: 'N' };
  }
  pos = f.pos(x, y - 1);
  if (!f.isUndefined(board[pos]) && board[pos]['team'] === enemyTeam && !exceptionsList.includes(pos)) {
    return { closestEnemy: pos, withinRange: true, direction: 'S' };
  }
  pos = f.pos(x - 1, y);
  if (!f.isUndefined(board[pos]) && board[pos]['team'] === enemyTeam && !exceptionsList.includes(pos)) {
    return { closestEnemy: pos, withinRange: true, direction: 'W' };
  }
  pos = f.pos(x + 1, y);
  if (!f.isUndefined(board[pos]) && board[pos]['team'] === enemyTeam && !exceptionsList.includes(pos)) {
    return { closestEnemy: pos, withinRange: true, direction: 'E' };
  }

  for (let i = 1; i <= 8; i++) {
    const withinRange = i <= range;
    console.log(withinRange, x, y, i, Math.abs(x - i), Math.abs(y - i), Math.abs(x + i), Math.abs(y + i));

    // Normal checks
    for (let j = x - i; j <= x + i; j++) {
      pos = f.pos(j, Math.abs(y - i));
      if (!f.isUndefined(board[pos]) && board[pos]['team'] === enemyTeam && !exceptionsList.includes(pos)) {
        const direction = _getDirection(unitPos, pos);
        return { closestEnemy: pos, withinRange, direction };
      }
      pos = f.pos(j, Math.abs(y + i));
      if (!f.isUndefined(board[pos]) && board[pos]['team'] === enemyTeam && !exceptionsList.includes(pos)) {
        const direction = _getDirection(unitPos, pos);
        return { closestEnemy: pos, withinRange, direction };
      }
    }

    for (let j = y - i + 1; j < y + i; j++) {
      pos = f.pos(Math.abs(x - i), j);
      if (!f.isUndefined(board[pos]) && board[pos]['team'] === enemyTeam && !exceptionsList.includes(pos)) {
        const direction = _getDirection(unitPos, pos);
        return { closestEnemy: pos, withinRange, direction };
      }
      pos = f.pos(Math.abs(x + i), j);
      if (!f.isUndefined(board[pos]) && board[pos]['team'] === enemyTeam && !exceptionsList.includes(pos)) {
        const direction = _getDirection(unitPos, pos);
        return { closestEnemy: pos, withinRange, direction };
      }
    }
  }
  // f.print(board, '@getClosestEnemy Returning undefined: Board\n');
  console.log('@getClosestEnemy Returning undefined: ', x, y, range, team);
  return { closestEnemy: undefined, withinRange: false, direction: '' };
};
