//geojson 转 wkt 

import {geojsonToWkt} from 'geojsonwkt'
const geojson = {
    "type": "Polygon",
    "coordinates": [
        [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]
    ]
}
const wkt = geojsonToWkt(geojson) // POLYGON((100 0,101 0,101 1,100 1,100 0))


//wkt 转 geojson 

import {wktToGeojson} from 'geojsonwkt'
const wkt = 'POLYGON((100 0,101 0,101 1,100 1,100 0))'
const geojson = wktToGeojson(wkt) // {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]]]}}