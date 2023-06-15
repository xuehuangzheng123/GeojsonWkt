/**geojson类型定义 */
type GeometryType = {
    type: string;
    coordinates: number[] | number[][] | number[][][] | number[][][][];
};
type FeatureType<T = {}> = {
    type: string;
    id?: string | number;
    bbox?: number[];
    geometry?: GeometryType;
    properties?: T;
};
type GeojsonType<T = {}, K = {}> = {
    type: string;
    crs?: {
        type: string;
        properties: K;
    };
    properties?: T;
    bbox?: number[];
    coordinates?: number[] | number[][] | number[][][] | number[][][][];
    geometry?: GeometryType;
    geometries?: GeometryType[];
    features?: FeatureType<T>[];
    gid?: number;
};
export declare function wktToGeojson(wkt: string): {
    type: string;
    features: FeatureType<{}>[];
    geometry?: undefined;
} | {
    type: string;
    geometry: GeometryType;
    features?: undefined;
} | undefined;
export declare function geojsonToWkt(geojson: GeojsonType): string;
export {};
