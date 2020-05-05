import AiPlayer from '../objects/AiPlayer';
import BattleUnit from '../objects/BattleUnit';
import Player from '../objects/Player';


export default class AIService {
  private self: AiPlayer;
  constructor(self: AiPlayer) {
    this.self = self;
  }

}
