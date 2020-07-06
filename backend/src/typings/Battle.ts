import Pathfinder from "../structures/Battle/Pathfinder";
import TargetPairPool from "../structures/Battle/TargetPairPool";
import BattleUnitList from "../structures/Battle/BattleUnitList";

export interface BattleContext {
  currentTimestamp: number;
  pathfinder: Pathfinder;
  targetPairPool: TargetPairPool;
  units: BattleUnitList;
}

export interface UnitAction {
  type: string;
  unitID: string;
  payload: object;
  time: number;
  effects?: [];
  uid?: string;
  parent?: string;
}

export interface BattleBoard {
  units: BattleUnitList;
  owner: string;
}