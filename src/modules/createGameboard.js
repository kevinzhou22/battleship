import createShip from './createShip';

function createGameboard(xLength, yLength) {
  if (!(xLength > 0) || !(yLength > 0)) {
    throw new RangeError('Arguments must be positive');
  }

  const shipsDetails = [];
  const hitCoordinatesList = [];
  const missedCoordinatesList = [];

  const getXLength = function getXLength() {
    return xLength;
  };

  const getYLength = function getYLength() {
    return yLength;
  };

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
    hitCoordinatesList.forEach((hitCoordinates) => {
      if (coordinates.x === hitCoordinates.x && coordinates.y === hitCoordinates.y) {
        throw new Error('Coordinates previously attacked');
      }
    });

    missedCoordinatesList.forEach((missedCoordinates) => {
      if (coordinates.x === missedCoordinates.x && coordinates.y === missedCoordinates.y) {
        throw new Error('Coordinates previously attacked');
      }
    });
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

  const getPlacedShips = function getPlacedShips() {
    const shipCoordinates = [];
    shipsDetails.forEach(({ coordinatesList }) => {
      const coordinatesListCopy = [];
      coordinatesList.forEach((coordinates) => {
        coordinatesListCopy.push({ ...coordinates });
      });
      shipCoordinates.push(coordinatesListCopy);
    });
    return shipCoordinates;
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

  const areCoordinatesValidForShip = function areCoordinatesValidForShip(shipCoordinates) {
    let valid = true;
    shipCoordinates.forEach((coordinates) => {
      shipsDetails.forEach(({ coordinatesList }) => {
        coordinatesList.forEach(({ x, y }) => {
          if (x === coordinates.x && y === coordinates.y) {
            valid = false;
          }
        });
      });
    });
    return valid;
  };

  return {
    getXLength,
    getYLength,
    receiveAttack,
    placeShip,
    getHitCoordinates,
    getMissedCoordinates,
    getPlacedShips,
    areAllShipsSunk,
    areCoordinatesValidForShip,
  };
}

export default createGameboard;
