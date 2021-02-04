import createShip from './createShip';

function createGameboard(xLength, yLength) {
  if (!(xLength > 0) || !(yLength > 0)) {
    throw new RangeError('Arguments must be positive');
  }

  const shipsDetails = [];
  const hitCoordinatesList = [];
  const missedCoordinatesList = [];

  const verifyCoordinatesAreValid = function verifyCoordinatesAreValid(coordinates) {
    if (!(coordinates.x < xLength && coordinates.y < yLength)) {
      throw new RangeError('Coordinates are invalid');
    }
  };

  const placeShip = function placeShip(coordinatesList) {
    const newShip = createShip(coordinatesList.length);
    const coordinatesListCopy = [];

    coordinatesList.forEach((coordinates) => {
      verifyCoordinatesAreValid(coordinates);
      coordinatesListCopy.push({ ...coordinates });
    });

    shipsDetails.push({
      ship: newShip,
      coordinatesList: coordinatesListCopy,
    });
  };

  const receiveAttack = function receiveAttack(coordinates) {
    verifyCoordinatesAreValid(coordinates);
    let hit = false;
    for (let i = 0; i < shipsDetails.length; i += 1) {
      const shipCoordinatesList = shipsDetails[i].coordinatesList;
      for (let j = 0; j < shipCoordinatesList.length; j += 1) {
        const shipCoordinates = shipCoordinatesList[j];
        const doCoordinatesMatch = (
          shipCoordinates.x === coordinates.x
          && shipCoordinates.y === coordinates.y
        );
        if (doCoordinatesMatch) {
          hitCoordinatesList.push({ ...coordinates });
          shipsDetails[i].ship.hit(j);
          hit = true;
        }
      }
    }
    if (!hit) {
      missedCoordinatesList.push({ ...coordinates });
    }
  };

  const getHitCoordinates = function getHitCoordinates() {
    const hitCoordinatesCopy = [];
    hitCoordinatesList.forEach((hitCoordinates) => {
      hitCoordinatesCopy.push({ ...hitCoordinates });
    });

    return hitCoordinatesCopy;
  };

  const getMissedCoordinates = function getMissedCoordinates() {
    const missedCoordinatesCopy = [];
    missedCoordinatesList.forEach((missedCoordinates) => {
      missedCoordinatesCopy.push({ ...missedCoordinates });
    });

    return missedCoordinatesCopy;
  };

  const areAllShipsSunk = function areAllShipsSunk() {
    let allSunk = true;
    shipsDetails.forEach((shipDetails) => {
      if (!shipDetails.ship.isSunk()) {
        allSunk = false;
      }
    });
    return allSunk;
  };

  return {
    receiveAttack,
    placeShip,
    getHitCoordinates,
    getMissedCoordinates,
    areAllShipsSunk,
  };
}

export default createGameboard;
