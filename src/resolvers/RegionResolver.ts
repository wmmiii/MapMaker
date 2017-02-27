import { TileIndex, TileRegion, TileRegionIndex } from 'Tile';
import Vec from 'Vec';

export abstract class RegionResolver {
    public abstract resolve(coordsStart: Vec, coordsEnd: Vec): TileRegionIndex[];

    protected newIndex(x: number, y: number, region: TileRegion): TileRegionIndex {
        return new TileRegionIndex(TileIndex.of(x, y), region);
    }
}

export default RegionResolver;