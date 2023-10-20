import { Feature, Geometry, GeoJSON } from 'geojson';
export declare function wktToGeojson(wkt: string): {
    type: string;
    features: Feature<Geometry, import("geojson").GeoJsonProperties>[];
    geometry?: undefined;
} | {
    type: string;
    geometry: Geometry;
    features?: undefined;
} | undefined;
export declare function geojsonToWkt(geojson: GeoJSON): string;
