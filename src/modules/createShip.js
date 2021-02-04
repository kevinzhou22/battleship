function createShip(length) {
  if (!(length > 0)) {
    throw new RangeError('Length must be positive');
  }
  const positions = [];
  for (let i = 0; i < length; i += 1) {
    positions.push(false);
  }

  const hit = function hit(position) {
    if (position >= length) {
      throw new RangeError('The argument must be below the Ship length');
    }
    positions[position] = true;
  };

  const isSunk = function isSunk() {
    let isAllHit = true;
    positions.forEach((position) => {
      if (!position) {
        isAllHit = false;
      }
    });

    return isAllHit;
  };

  return {
    hit,
    isSunk,
  };
}

export default createShip;
