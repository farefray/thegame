export const PARTICLES = {
  arrow: {
    speed: 250
  },
  fireball: {
    speed: 750
  }
}

export const EFFECTS = {
  thunderstorm: {
    duration: 1000
  },
  green_sparkles: {
    duration: 500
  },
  blood: {
    duration: 250
  }
}

export interface IEffect {
  id: string;
  duration?: number;
  from?: {
    x: number,
    y: number
  }
}