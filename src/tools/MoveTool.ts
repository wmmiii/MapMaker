import App from 'App';
import { Tool } from 'Tool';
import Vec from 'Vec';

/**
 * Moves the map relative to the viewport.
 */
export default class MoveTool implements Tool {
    private app: App;
    private startingOffset: Vec;
    
    constructor(app: App) {
        this.app = app;
        this.startingOffset = null;
    }

    cancel() {
        this.startingOffset = null;
    }

    hover(startCoords: Vec, endCoords: Vec): void {
        if (startCoords === endCoords) {
            return;
        }

        if (this.startingOffset === null) {
            this.startingOffset = this.app.getOffset();
        }
        this.app.setOffset(
            this.startingOffset.add(endCoords.sub(startCoords)));
    }

    select(_: Vec, __: Vec): void {
        this.startingOffset = null;
    }
}