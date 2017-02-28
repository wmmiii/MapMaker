import App from 'App';
import { Tool } from 'Tool';
import Vec from 'Vec';

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
        if (this.startingOffset === null) {
            this.startingOffset = this.app.getOffset();
        }
        this.app.setOffset(
            this.startingOffset.add(endCoords.sub(startCoords)));
    }

    select(startCoords: Vec, endCoords: Vec): void {
        this.startingOffset = null;
    }
}