// todo review format for those, as its ugly and too big
export const EFFECTS = {
  thunderstorm: {
    duration: 1000
  },
  blue_chain: {
    duration: 500
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