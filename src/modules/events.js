const eventsList = {};

function on(eventName, fn) {
  eventsList[eventName] = eventsList[eventName] || [];
  eventsList[eventName].push(fn);
}

function off(eventName, fn) {
  if (eventsList[eventName]) {
    for (let i = 0; i < eventsList[eventName].length; i += 1) {
      if (eventsList[eventName][i] === fn) {
        eventsList[eventName].splice(i, 1);
        break;
      }
    }
  }
}

function emit(eventName, data) {
  if (eventsList[eventName]) {
    eventsList[eventName].forEach((fn) => {
      fn(data);
    });
  }
}

const events = {
  on,
  off,
  emit,
};

export { events as default };
