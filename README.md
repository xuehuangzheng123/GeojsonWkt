##### 方法示例

##### geojson 转 wkt 适用于二维坐标转换

```js
import geofuns from 'geojsonwkt';
const { geojsonToWkt } = geofuns;
const geojson = {
  type: 'Polygon',
  coordinates: [
    [
      [100.0, 0.0],
      [101.0, 0.0],
      [101.0, 1.0],
      [100.0, 1.0],
      [100.0, 0.0],
    ],
  ],
};
const geojson1 = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [100, 0],
        [101, 0],
        [101, 1],
        [100, 1],
        [100, 0],
      ],
    ],
  },
};
const wkt = geojsonToWkt(geojson); // POLYGON((100 0,101 0,101 1,100 1,100 0))
const wkt1 = geojsonToWkt(geojson1); // POLYGON((100 0,101 0,101 1,100 1,100 0))
```

##### wkt 转 geojson

```js
import geofuns from 'geojsonwkt';
const { wktToGeojson } = geofuns;
const wkt = 'POLYGON((100 0,101 0,101 1,100 1,100 0))';
const geojson = wktToGeojson(wkt); // {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]]]}}
```

##### 生成中国范围内的遮罩

```js
import geofuns from 'geojsonwkt';
const { createMaskPolygon } = geofuns;
const geojson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [107.220598, 38.59126],
            [111.695778, 36.165477],
            [111.068417, 34.044305],
            [106.133171, 35.521318],
            [107.220598, 38.59126],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [107.366982, 32.028421],
            [107.366982, 34.459151],
            [115.418125, 34.459151],
            [115.418125, 32.028421],
            [107.366982, 32.028421],
          ],
        ],
      },
    },
  ],
};
const mask = createMaskPolygon(geojson);
/* {
    "type": "Feature",
    "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [73,3],
              [136,3],
              [136,54],
              [73,54],
              [73,3]
            ],
            [
              [106.133171,35.521318],
              [109.68226328157235,34.459151],
              [107.366982,34.459151],
              [107.366982,32.028421],
              [115.418125,32.028421],
              [115.418125,34.459151],
              [111.19111247278863,34.459151],
              [111.695778,36.165477],
              [107.220598,38.59126],
              [106.133171,35.521318]
            ]
          ]
        ]
    },
    "properties": {}
}*/
```
