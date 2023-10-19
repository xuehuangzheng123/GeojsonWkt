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
import {createMaskPolygon}from './createMask'
type GeometryExcludeCollection =
  | Point
  | MultiPoint
  | LineString
  | MultiLineString
  | Polygon
  | MultiPolygon
// wkt转geojson
function wktToGeometry(wkt: string) {
  try {
    const typeStr = wkt.match(/^[A-Z]+(?=\()/)
    if (!typeStr) {
      console.log('wkt数据格式不对,没有解析到type')
      return
    }
    const type = typeStr[0]
    let geometry: Geometry | undefined

    if (type === 'POINT') {
      const res = wkt.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g)
      if (!res) {
        console.log('没有解析到POINT的坐标')
        return
      }
      const coords = res[0].split(' ').map(Number)
      geometry = { type: 'Point', coordinates: coords }
    } else if (type === 'LINESTRING') {
      const res = wkt.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g)
      if (!res) {
        console.log('没有解析到LINESTRING的坐标')
        return
      }
      const coords: number[][] = []
      res.forEach((item) => {
        coords.push(item.split(' ').map(Number))
      })
      geometry = { type: 'LineString', coordinates: coords }
    } else if (type === 'MULTIPOINT') {
      const res = wkt.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g)
      if (!res) {
        console.log('没有解析到MULTIPOINT的坐标')
        return
      }
      const coords: number[][] = []
      res.forEach((item) => {
        coords.push(item.split(' ').map(Number))
      })
      geometry = { type: 'MultiPoint', coordinates: coords }
    } else if (type === 'POLYGON') {
      const resArr = wkt.split(/,(?=\()/)
      const coords: number[][][] = []
      for (let i = 0; i < resArr.length; i++) {
        const res = resArr[i].match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g)
        if (!res) {
          console.log('没有解析到POLYGON的坐标')
          return
        }
        const ringCoords: number[][] = []
        res.forEach((ele) => {
          ringCoords.push(ele.split(' ').map(Number))
        })
        coords.push(ringCoords)
      }
      geometry = { type: 'Polygon', coordinates: coords }
    } else if (type === 'MULTILINESTRING') {
      const resArr = wkt.split(/,(?=\()/)
      const coords: number[][][] = []
      for (let i = 0; i < resArr.length; i++) {
        const res = resArr[i].match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g)
        if (!res) {
          console.log('没有解析到MULTILINESTRING的坐标')
          return
        }
        const ringCoords: number[][] = []
        res.forEach((ele) => {
          ringCoords.push(ele.split(' ').map(Number))
        })
        coords.push(ringCoords)
      }
      geometry = { type: 'MultiLineString', coordinates: coords }
    } else if (type === 'MULTIPOLYGON') {
      const resArr1 = wkt.split(/,(?=\(\()/)
      const coords: number[][][][] = []
      for (let i = 0; i < resArr1.length; i++) {
        const resArr2 = resArr1[i].split(/,(?=\()/)
        const polyCoords: number[][][] = []
        for (let j = 0; j < resArr2.length; j++) {
          const res = resArr2[j].match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g)
          if (!res) {
            console.log('没有解析到MULTIPOLYGON的坐标')
            return
          }
          const ringCoords: number[][] = []
          res.forEach((ele) => {
            ringCoords.push(ele.split(' ').map(Number))
          })
          polyCoords.push(ringCoords)
        }
        coords.push(polyCoords)
      }
      geometry = { type: 'MultiPolygon', coordinates: coords }
    }
    return geometry
  } catch (error) {
    console.log('格式解析出错', error)
  }
}
export function wktToGeojson(wkt: string) {
  console.log(wkt)

  try {
    wkt = wkt
      .replaceAll('\n', ' ')
      .replaceAll(/\s+/g, ' ')
      .replaceAll(' ,', ',')
      .replaceAll(', ', ',')
      .replaceAll(' (', '(')
      .replaceAll('( ', '(')
      .replaceAll(' )', ')')
      .replaceAll(') ', ')')
      .toUpperCase()
    const typeStr = wkt.match(/^[A-Z]+(?=\()/)
    if (!typeStr) {
      console.log('wkt数据格式不对,没有解析到type')
      return
    }
    const type = typeStr[0]
    if (type === 'GEOMETRYCOLLECTION') {
      wkt = wkt.substring(19, wkt.length - 1)
      const resArr = wkt.split(/,(?=[A-Z]+)/)
      const features: Feature[] = []
      for (let i = 0; i < resArr.length; i++) {
        const geometry = wktToGeometry(resArr[i])
        if (!geometry) return
        features.push({ type: 'Feature', geometry, properties: {} })
      }
      return { type: 'FeatureCollection', features }
    } else {
      const resArr = wkt.split(/,(?=[A-Z]+)/)
      if (resArr.length > 1) {
        const features: Feature[] = []
        for (let i = 0; i < resArr.length; i++) {
          const geometry = wktToGeometry(resArr[i])
          if (!geometry) return
          features.push({ type: 'Feature', geometry, properties: {} })
        }
        return { type: 'FeatureCollection', features }
      } else {
        if (
          [
            'POINT',
            'LINESTRING',
            'POLYGON',
            'MULTIPOINT',
            'MULTILINESTRING',
            'MULTIPOLYGON',
          ].includes(type)
        ) {
          const geometry = wktToGeometry(wkt)
          if (!geometry) return
          return { type: 'Feature', geometry }
        } else {
          console.log('wkt数据的type不太对-->', type)
          return
        }
      }
    }
  } catch (error) {
    console.log('格式解析出错', error)
  }
}

// geojson转wkt
function geometryToWkt(geometry: GeometryExcludeCollection) {
  if (!geometry) {
    console.log('没有geojson数据')
    return ''
  }
  const { type } = geometry
  if (!type) {
    console.log('数据中没有type')
    return ''
  }
  if (typeof type !== 'string') {
    console.log('数据中的type不是字符串')
    return ''
  }
  const coords = geometry.coordinates
  if (!coords) {
    console.log('数据中没有coordinates')
    return ''
  }
  if (!(coords instanceof Array)) {
    console.log('数据的coordinates不是数组')
    return ''
  }
  if (coords.length === 0) {
    console.log('数据的coordinates是空的')
    return ''
  }
  const wktCoords: string[] = []

  switch (type.toUpperCase()) {
    case 'POINT':
      if (coords.length < 2) {
        console.log('type为Point的coordinates格式不对-->', coords)
        return ''
      }
      for (let i = 0; i < coords.length; i++) {
        if (typeof coords[i] !== 'number' || isNaN(coords[i] as number)) {
          console.log('type为Point的coordinates格式不对-->', coords[i])
          return ''
        }
      }
      wktCoords.push(coords.slice(0, 2).join(' '))
      break
    case 'LINESTRING':
    case 'MULTIPOINT':
      for (let i = 0; i < coords.length; i++) {
        const coord = coords[i] as number[]
        if (!(coord instanceof Array) || coord.length < 2) {
          console.log(
            'type为MultiPoint或LineString的coordinates格式不对-->',
            coord
          )
          return ''
        }
        for (let j = 0; j < coord.length; j++) {
          if (typeof coord[j] !== 'number' || isNaN(coord[j] as number)) {
            console.log(
              'type为MultiPoint或LineString的coordinates格式不对-->',
              coord[j]
            )
            return ''
          }
        }
        wktCoords.push(coord.slice(0, 2).join(' '))
      }
      break
    case 'POLYGON':
    case 'MULTILINESTRING':
      for (let i = 0; i < coords.length; i++) {
        const item = coords[i]
        const ringCoords: string[] = []
        if (!(item instanceof Array)) {
          console.log(
            'type为Polygon或MultiLineString的coordinates格式不对-->',
            item
          )
          return ''
        }
        for (let j = 0; j < item.length; j++) {
          const ele = item[j]
          if (!(ele instanceof Array) || ele.length < 2) {
            console.log(
              'type为Polygon或MultiLineString的coordinates格式不对-->',
              ele
            )
            return ''
          }
          for (let k = 0; k < ele.length; k++) {
            if (typeof ele[k] !== 'number' || isNaN(ele[k] as number)) {
              console.log(
                'type为Polygon或MultiLineString的coordinates格式不对-->',
                ele[k]
              )
              return ''
            }
          }
          ringCoords.push(ele.slice(0, 2).join(' '))
        }
        wktCoords.push(`(${ringCoords.join(',')})`)
      }
      break
    case 'MULTIPOLYGON':
      for (let i = 0; i < coords.length; i++) {
        const item = coords[i]
        const polyCoords: string[] = []
        if (!(item instanceof Array)) {
          console.log('type为MultiPolygon的coordinates格式不对-->', item)
          return ''
        }
        for (let j = 0; j < item.length; j++) {
          const ele = item[j]
          const ringCoords: string[] = []
          if (!(ele instanceof Array)) {
            console.log('type为MultiPolygon的coordinates格式不对-->', ele)
            return ''
          }
          for (let k = 0; k < ele.length; k++) {
            const mem = ele[k]
            if (!(mem instanceof Array) || mem.length < 2) {
              console.log('type为MultiPolygon的coordinates格式不对-->', mem)
              return ''
            }
            for (let n = 0; n < mem.length; n++) {
              if (typeof mem[n] !== 'number' || isNaN(mem[n] as number)) {
                console.log(
                  'type为Polygon或MultiLineString的coordinates格式不对-->',
                  mem[n]
                )
                return ''
              }
            }
            ringCoords.push(mem.slice(0, 2).join(' '))
          }
          polyCoords.push(`(${ringCoords.join(',')})`)
        }
        wktCoords.push(`(${polyCoords.join(',')})`)
      }
      break
    default:
      console.log(`这个geojson中的type值好像不太对--> type: ${type}`)
      return ''
  }
  return `${type.toUpperCase()}(${wktCoords.join(',')})`
}

export function geojsonToWkt(geojson: GeoJSON) {
  if (!geojson) {
    console.log('没有geojson数据')
    return ''
  }
  const { type } = geojson
  if (!type) {
    console.log('这个geojson没有type')
    return ''
  }
  if (typeof type !== 'string') {
    console.log('这个geojson的type不是字符串')
    return ''
  }
  if (
    [
      'POINT',
      'LINESTRING',
      'POLYGON',
      'MULTIPOINT',
      'MULTILINESTRING',
      'MULTIPOLYGON',
    ].includes(type.toUpperCase())
  ) {
    return geometryToWkt(geojson as GeometryExcludeCollection)
  } else if (type.toUpperCase() === 'FEATURE') {
    const { geometry } = geojson as Feature
    if (!geometry) {
      console.log('type为Feature的数据没有geometry-->', geojson)
      return ''
    }
    if (geometry.type.toUpperCase() === 'GEOMETRYCOLLECTION') {
      const { geometries } = geometry as GeometryCollection
      return `GEOMETRYCOLLECTION(${handleGeometries(geometries)})`
    }
    return geometryToWkt(geometry as GeometryExcludeCollection)
  } else if (type.toUpperCase() === 'GEOMETRYCOLLECTION') {
    const { geometries } = geojson as GeometryCollection
    const result = handleGeometries(geometries)
    return `GEOMETRYCOLLECTION(${result})`
  } else if (type.toUpperCase() === 'FEATURECOLLECTION') {
    const wkts: string[] = []
    const { features } = geojson as FeatureCollection
    if (!features) {
      console.log('type为FeatureCollection的数据没有features-->', geojson)
      return ''
    }
    if (!(features instanceof Array)) {
      console.log('type为FeatureCollection的数据中features不是数组-->', geojson)
      return ''
    }
    for (let i = 0; i < features.length; i++) {
      const item = features[i]
      const { type } = item
      if (!type) {
        console.log('这个feature没有type-->', item)
        return ''
      }
      if (typeof type !== 'string') {
        console.log('这个feature的type不是字符串-->', item)
        return ''
      }
      const { geometry } = item
      if (!geometry) {
        console.log('这个feature没有geometry-->', item)
        return ''
      }
      if (geometry.type.toUpperCase() === 'GEOMETRYCOLLECTION') {
        const { geometries } = geometry as GeometryCollection
        wkts.push(handleGeometries(geometries))
      } else {
        wkts.push(geometryToWkt(geometry as GeometryExcludeCollection))
      }
    }
    return `GEOMETRYCOLLECTION(${wkts.join(',')})`
  } else {
    console.log(`这个geojson的type值好像不太对--> type: ${type}`)
    return ''
  }
}

function handleGeometries(geometries: any) {
  const wkts: string[] = []
  if (!geometries) {
    console.log('type为GeometryCollection的数据没有geometries-->', geometries)
    return ''
  }
  if (!(geometries instanceof Array)) {
    console.log(
      'type为GeometryCollection的数据中geometries不是数组-->',
      geometries
    )
    return ''
  }
  for (let i = 0; i < geometries.length; i++) {
    wkts.push(geometryToWkt(geometries[i]))
  }
  return wkts.join(',')
}

export default createMaskPolygon