import RegionResolver from 'RegionResolver';
import { TileRegion, TileRegionIndex } from 'Tile';
import Vec from 'Vec';

export default class DiagResolver extends RegionResolver {
    private static instance: DiagResolver;

    static getInstance(): DiagResolver {
        if (!DiagResolver.instance) {
            DiagResolver.instance = new DiagResolver();
        }
        return DiagResolver.instance;
    }

    private constructor() {
        super();
    }

    resolve(startCoords: Vec, endCoords: Vec): TileRegionIndex[] {
        let tileCoords = new Vec(startCoords.x % 1, startCoords.y % 1);

        // Calculate starting index
        const baseX = Math.floor(startCoords.x);
        const baseY = Math.floor(startCoords.y);

        if (tileCoords.x < 0.5) {
            if (tileCoords.y < 0.5) {
                return [this.newIndex(baseX, baseY, TileRegion.UPPER_LEFT)];
            } else {
                return [this.newIndex(baseX, baseY, TileRegion.LOWER_LEFT)];
            }
        } else {
            if (tileCoords.y < 0.5) {
                return [this.newIndex(baseX, baseY, TileRegion.UPPER_RIGHT)];
            } else {
                return [this.newIndex(baseX, baseY, TileRegion.LOWER_RIGHT)];
            }
        }
    }
}