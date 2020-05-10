import Battle from '../src/objects/Battle';
import monsterUtils from '../src/utils/monsterUtils';
class GameConnector {
    constructor() {
        const allUnits = monsterUtils.getAllUnits();
        const unitsByCost = {};
        for (const monsterName in allUnits) {
            if (object.hasOwnProperty(monsterName)) {
                const monster = object[monsterName];
                if (!unitsByCost[monster.cost]) {
                    unitsByCost[monster.cost] = [];
                }

                unitsByCost.push(monster);
            }
        }

        this.state = {
            units1: [],
            units2: ['elf'],
            playerTurn: 1,
            winner: -1,
            moves: 0,
            gameOver: false
        }
    }

    getState() {
        return this.state
    }

    setState(state) {
        this.state = state;
    }

    cloneState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    moves() {
        return ['dwarf', 'elf', 'minotaur', 'target_melee']
    }

    playMove(move) {
        console.log("GameConnector -> playMove -> move", move)
        if (this.state.playerTurn === 1) {
            this.state.units1.push(move);
        } else {
            this.state.units2.push(move);
        }

        const playerBoard = [];
        for (let index = 0; index < this.state.units1.length; index++) {
            playerBoard.push({
                name: this.state.units1[index],
                x: index,
                y: 0,
            });
        }

        const opponentBoard = [];
        for (let index = 0; index < this.state.units2.length; index++) {
            opponentBoard.push({
                name: this.state.units2[index],
                x: index,
                y: 7,
            });
        }

        const battle = new Battle({ units: playerBoard, owner: 1 }, { units: opponentBoard, owner: 2 });
        this.state.gameOver = true
        this.state.winner = battle.winner;

        this.state.playerTurn = (this.state.playerTurn == 1) ? 2 : 1 
        this.state.moves += 1
    }

    gameOver(){
        return this.state.gameOver
    }

    winner(){
        return this.state.winner
    }
}

module.exports = GameConnector;
