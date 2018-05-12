import { Index, Region, RegionIndex } from 'Tile';
import Vec from 'Vec';

/**
 * Region resolvers take in the starting and ending coordinates of a selecting
 * boundary in map-space and return the RegionIndexs selected by the action.
 * Resolvers may modify their behavior given the position of the starting or
 * ending coordinates. Resolvers must never store any state.
 */
export abstract class RegionResolver {
    /**
     * Given the starting and ending coordinates of a selection boundary
     * returns an array of RegionIndexs that were selected.
     * 
     * Note that coordsStart == coordsEnd if the boundary describes a single
     * point.
     * 
     * @param coordsStart The starting coordinates of the action in map-space.
     * @param coordsEnd The ending coordinates of the action in map-space.
     */
    public abstract resolve(coordsStart: Vec, coordsEnd: Vec): RegionIndex[];

    /**
     * Helper function to return a new RegionIndex given a tile's index and the
     * region being returned.
     * 
     * @param x The x index of the tile which contains the referenced region.
     * @param y The y index of the tile which contains the referenced region.
     * @param region Which region of the tile at [x, y] is being referenced.
     */
    protected newIndex(x: number, y: number, region: Region): RegionIndex {
        return new RegionIndex(Index.of(x, y), region);
    }
}

export default RegionResolver;