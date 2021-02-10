import './reset.css';
import './style.css';
import createGame from './modules/createGame';
import createDOMController from './modules/createDOMController';
import events from './modules/events';

const DOMController = createDOMController(createGame(events));
DOMController.initialize();
