import { MCTS } from './MCTS';
import GameConnector from './gameConnector';

/*
Basic AI vs AI action
*/

let game = new GameConnector()

let iterations = 1 //more iterations -> stronger AI, more computation
let exploration = 1.41 //exploration vs. explotation parameter, sqrt(2) is reasonable default (c constant in UBC forumula)

let player1 = new MCTS(game, 1, iterations, exploration)
let player2 = new MCTS(game, 2, iterations, exploration)

while (true){
    console.log('while')
    let p1_move = player1.selectMove()
    console.log("p1_move", p1_move)
    game.playMove(p1_move)

    let p2_move = player2.selectMove()
    console.log("p2_move", p2_move)
    game.playMove(p2_move)

    console.log("game", game)
    if (game.gameOver()) {break}
}

console.log(game.winner())
