import RegionResolver from 'RegionResolver';
import { TileRegion, TileRegionIndex } from 'Tile';
import Vec from 'Vec';

export default class BoxResolver extends RegionResolver {
    private static instance: BoxResolver;
    private static readonly edgeDist: number = 0.3;

    static getInstance(): BoxResolver {
        if (!BoxResolver.instance) {
            BoxResolver.instance = new BoxResolver();
        }
        return BoxResolver.instance;
    }

    private constructor() {
        super();
    }

    resolve(startCoords: Vec, endCoords: Vec): TileRegionIndex[] {
        let tileCoords = new Vec(startCoords.x % 1, startCoords.y % 1);

        // Calculate starting index
        const baseX = Math.floor(startCoords.x);
        const baseY = Math.floor(startCoords.y);

        // Calculate bounding indicies
        const left = Math.floor(Math.min(startCoords.x, endCoords.x));
        const top = Math.floor(Math.min(startCoords.y, endCoords.y));
        const right = Math.floor(Math.max(startCoords.x, endCoords.x));
        const bottom = Math.floor(Math.max(startCoords.y, endCoords.y));

        const start = this.resolveStart(tileCoords, baseX, baseY);
        const elements: TileRegionIndex[] = [];

        if (start.tileRegion === TileRegion.SQUARE) {
            for (let x = left; x <= right; x++) {
                for (let y = top; y <= bottom; y++) {
                    elements.push(this.newIndex(x, y, TileRegion.SQUARE));
                }
            }
        } else if (start.tileRegion === TileRegion.TOP_EDGE) {
            for (let x = left; x <= right; x++) {
                elements.push(this.newIndex(x, start.tileIndex.y,
                    TileRegion.TOP_EDGE));
            }
        } else if (start.tileRegion === TileRegion.LEFT_EDGE) {
            for (let y = top; y <= bottom; y++) {
                elements.push(this.newIndex(start.tileIndex.x, y,
                    TileRegion.LEFT_EDGE));
            }
        }

        return elements;
    }

    private resolveStart(coords: Vec, baseX: number, baseY: number): TileRegionIndex {
        const edgeDist = BoxResolver.edgeDist;

        const distLeft = coords.x;
        const distRight = 1 - coords.x
        const distTop = coords.y;
        const distBottom = 1 - coords.y;

        if (distLeft < edgeDist) {
            if (distLeft <= distTop && distLeft <= distBottom) {
                return this.newIndex(baseX, baseY, TileRegion.LEFT_EDGE);
            }
        }

        if (distTop < edgeDist) {
            if (distTop <= distRight) {
                return this.newIndex(baseX, baseY, TileRegion.TOP_EDGE);
            }
        }

        if (distRight < edgeDist) {
            if (distRight <= distBottom) {
                return this.newIndex(baseX + 1, baseY, TileRegion.LEFT_EDGE);
            }
        }

        if (distBottom < edgeDist) {
            return this.newIndex(baseX, baseY + 1, TileRegion.TOP_EDGE);
        }

        return this.newIndex(baseX, baseY, TileRegion.SQUARE);
    }
}