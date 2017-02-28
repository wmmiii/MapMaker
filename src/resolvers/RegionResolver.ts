import { Index, Region, RegionIndex } from 'Tile';
import Vec from 'Vec';

export abstract class RegionResolver {
    public abstract resolve(coordsStart: Vec, coordsEnd: Vec): RegionIndex[];

    protected newIndex(x: number, y: number, region: Region): RegionIndex {
        return new RegionIndex(Index.of(x, y), region);
    }
}

export default RegionResolver;