import {
  Feature,
  Geometry,
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon,
  GeoJSON,
  GeometryCollection,
  FeatureCollection,
} from 'geojson'
import * as turf from '@turf/turf'
type GeometryExcludeCollection =
  | Point
  | MultiPoint
  | LineString
  | MultiLineString
  | Polygon
  | MultiPolygon


export function createMaskPolygon(geojson: GeoJSON):GeoJSON | undefined{
  if(!geojson) {
    console.log('没有geojson数据');
    return undefined;
  }
  const {type} = geojson;
  if(!type) {
    console.log('没有解析到type');
    return undefined;
  }
  const newType = type.toLowerCase()
  try {
    if (newType === 'featurecollection') {
      const { features } = geojson as FeatureCollection
      const unionFeatures : Feature[] = []
      features.forEach((item)=>{
        if (item.geometry.type.toLowerCase() === 'geometrycollection') {
          const geo = unionGeometries(item.geometry as GeometryCollection);
          unionFeatures.push(geo as any)
        } else {
          unionFeatures.push(item)
        }
      })
      //@ts-ignore
      const unionPolygon = turf.union(...unionFeatures);
      const masked = createMaskByUnion(unionPolygon as any);
      return masked;
    } else if (newType === 'feature') {
      const { geometry } = geojson as Feature
      if (geometry.type.toLowerCase() === 'geometrycollection') {
        const unionPolygon = unionGeometries(geometry as GeometryCollection);
        const masked = createMaskByUnion(unionPolygon as any);
        return masked;
      } else {
        const masked = createMaskByUnion(geojson as Feature);
        return masked;
      }
    } else {
      const feature: Feature = {
        type: 'Feature',
        geometry: geojson as GeometryExcludeCollection,
        properties: {}
      }
      const masked = createMaskByUnion(feature);
      return masked;
    }
  } catch (error) {
    console.log('生成遮罩发生错误',error)
  }
}

function unionGeometries(geometry:GeometryCollection) {
  const { geometries } = geometry
  const newGeometries = geometries.map((item) => {
    return {
      type: 'Feature',
      geometry: item
    }
  })
  //@ts-ignore
  const unionPolygon = turf.union(...newGeometries);
  return unionPolygon
}

function createMaskByUnion(feature: Feature) {
  const coor: any = [];
  // 中国的四至范围取整
  const bboxAll = [
    [73, 3],
    [136, 3],
    [136, 54],
    [73, 54],
    [73, 3],
  ];
  const geometry: GeometryExcludeCollection = feature.geometry as GeometryExcludeCollection
  if (geometry.type.toLowerCase() === 'polygon') {
    geometry.coordinates.forEach((item: any, index: number) => {
      if (index === 0) {
        coor.push([bboxAll, item]);
      } else {
        coor.push(item);
      }
    });
  } else if (geometry.type.toLowerCase() === 'multipolygon') {
    const maskArr = [bboxAll];
    geometry.coordinates.forEach((item: any) => {
      if (item.length > 1) {
        item.forEach((ele: any, index: number) => {
          if (index === 0) {
            maskArr.push(ele);
          } else {
            coor.push([ele]);
          }
        });
      } else {
        maskArr.push(item[0]);
      }
    });
    coor.unshift(maskArr);
  } else {
    // 先不考虑非面的情况
    return undefined;
  }
  const result :Feature = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: coor,
    },
    properties: {}
  };
  return result;
}