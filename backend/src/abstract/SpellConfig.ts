
/**
 * @description Data structure which respresents monsters spell with basic configuration.
 * We hold here only configuration for common spell parts, which later is being used inside spell logic(so we can adjust values right from monster configuration, while hard spell logic stays separated and we do not mess inside)
 */
export default interface SpellConfig {
  name: string;
  mana: number;
  value: number
};
