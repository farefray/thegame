function getDirection(angle) {
  var directions = ['North', 'North-West', 'West', 'South-West', 'South', 'South-East', 'East', 'North-East'];
  return directions[Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8];
}

function getDirection2(angle) {
  var directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"]

  var scale = function (value, from, to) {
    percent = (Math.abs(value) - Math.abs(from[0])) / (Math.abs(from[1]) - Math.abs(from[0]));
    return percent * (Math.abs(to[1]) - Math.abs(to[0])) + Math.abs(to[0]);
  }

  return directions[Math.round(scale(angle,[0,360],[0,8]))]
}


console.log( getDirection(0) );
console.log( getDirection(45) );
console.log( getDirection(90) );
console.log( getDirection(180) );
console.log( getDirection(260) );

console.log( getDirection2(0) );
console.log( getDirection2(45) );
console.log( getDirection2(90) );
console.log( getDirection2(180) );
console.log( getDirection2(260) );

const angle = (anchor, point) => Math.atan2(anchor.y - point.y, anchor.x - point.x) * 180 / Math.PI + 180;

const p = {
	x: 3,
	y: 4
};

const a = {
	x: 6,
	y: 4
};

angle(a, p); // 225

// angle in degrees, from example, same data
angleDeg = Math.atan2(a.x - p.x, a.y - p.y) * 180 / Math.PI; // 45
console.log( getDirection(angleDeg) );
console.log( getDirection2(angleDeg) );

