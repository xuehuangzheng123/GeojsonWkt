/**geojson类型定义 */
type GeometryType = {
  type: string
  coordinates: number[] | number[][] | number[][][] | number[][][][]
}
type FeatureType<T = {}> = {
  type: string
  id?: string | number
  bbox?: number[]
  geometry?: GeometryType
  properties?: T
}
type GeojsonType<T = {}, K = {}> = {
  type: string
  crs?: {
    type: string
    properties: K
  }
  properties?: T
  bbox?: number[]
  coordinates?: number[] | number[][] | number[][][] | number[][][][]
  geometry?: GeometryType
  geometries?: GeometryType[]
  features?: FeatureType<T>[]
  gid?: number
}
// wkt转geojson
function wktToGeometry(wkt: string) {
  try {
    const type = wkt.match(/^[A-Z]+(?=\()/)![0]
    let geometry: GeometryType | undefined

    if (type === 'POINT') {
      const res = wkt.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g)
      const coords = res![0].split(' ').map(Number)
      geometry = { type: 'Point', coordinates: coords }
    } else if (type === 'LINESTRING') {
      const res = wkt.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g)
      const coords: number[][] = []
      res?.forEach((item) => {
        coords.push(item.split(' ').map(Number))
      })
      geometry = { type: 'LineString', coordinates: coords }
    } else if (type === 'MULTIPOINT') {
      const res = wkt.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g)
      const coords: number[][] = []
      res?.forEach((item) => {
        coords.push(item.split(' ').map(Number))
      })
      geometry = { type: 'MultiPoint', coordinates: coords }
    } else if (type === 'POLYGON') {
      const resArr = wkt.split(/,(?=\()/)
      const coords: number[][][] = []
      resArr.forEach((item) => {
        const res = item.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g)
        const ringCoords: number[][] = []
        res?.forEach((ele) => {
          ringCoords.push(ele.split(' ').map(Number))
        })
        coords.push(ringCoords)
      })
      geometry = { type: 'Polygon', coordinates: coords }
    } else if (type === 'MULTILINESTRING') {
      const resArr = wkt.split(/,(?=\()/)
      const coords: number[][][] = []
      resArr.forEach((item) => {
        const res = item.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g)
        const ringCoords: number[][] = []
        res?.forEach((ele) => {
          ringCoords.push(ele.split(' ').map(Number))
        })
        coords.push(ringCoords)
      })
      geometry = { type: 'MultiLineString', coordinates: coords }
    } else if (type === 'MULTIPOLYGON') {
      const resArr1 = wkt.split(/,(?=\(\()/)
      const coords: number[][][][] = []
      resArr1.forEach((item) => {
        const resArr2 = item.split(/,(?=\()/)
        console.log(resArr2)
        const polyCoords: number[][][] = []
        resArr2.forEach((ele) => {
          const res = ele.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g)
          const ringCoords: number[][] = []
          res?.forEach((ele) => {
            ringCoords.push(ele.split(' ').map(Number))
          })
          polyCoords.push(ringCoords)
        })
        coords.push(polyCoords)
      })
      geometry = { type: 'MultiPolygon', coordinates: coords }
    }
    return geometry
  } catch (error) {
    console.log('格式解析出错', error)
  }
}
export function wktToGeojson(wkt: string) {
  try {
    wkt = wkt
      .replaceAll('\n', '')
      .replaceAll('  ', '')
      .replaceAll(' ,', ',')
      .replaceAll(', ', ',')
      .replaceAll(' (', '(')
      .replaceAll('( ', '(')
      .replaceAll(' )', ')')
      .replaceAll(') ', ')')
    const type = wkt.match(/^[A-Z]+(?=\()/)![0]
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
      return { type: 'Feature', geometry: wktToGeometry(wkt) }
    } else if (type === 'GEOMETRYCOLLECTION') {
      wkt = wkt.substring(19, wkt.length - 1)
      const resArr = wkt.split(/,(?=[A-Z]+)/)
      const features: FeatureType[] = []
      resArr.forEach((item) => {
        features.push({ type: 'Feature', geometry: wktToGeometry(item) })
      })
      return { type: 'FeatureCollection', features }
    }
  } catch (error) {
    console.log('格式解析出错', error)
  }
}
// geojson转wkt
function geometryToWkt(geometry: GeometryType) {
  const type = geometry.type
  const coords = geometry.coordinates
  const wktCoords: string[] = []

  switch (type.toUpperCase()) {
    case 'POINT':
      wktCoords.push(coords.slice(0, 2).join(' '))
      break
    case 'LINESTRING':
    case 'MULTIPOINT':
      coords.forEach((item) => {
        item instanceof Array && wktCoords.push(item.slice(0, 2).join(' '))
      })
      break
    case 'POLYGON':
    case 'MULTILINESTRING':
      coords.forEach((item) => {
        const ringCoords: string[] = []
        item instanceof Array &&
          item.forEach((ele) => {
            ele instanceof Array && ringCoords.push(ele.slice(0, 2).join(' '))
          })
        wktCoords.push(`(${ringCoords.join(',')})`)
      })
      break
    case 'MULTIPOLYGON':
      coords.forEach((item) => {
        const polyCoords: string[] = []
        item instanceof Array &&
          item.forEach((ele) => {
            const ringCoords: string[] = []
            ele instanceof Array &&
              ele.forEach((mem) => {
                mem instanceof Array &&
                  ringCoords.push(mem.slice(0, 2).join(' '))
              })
            polyCoords.push(`(${ringCoords.join(',')})`)
          })
        wktCoords.push(`(${polyCoords.join(',')})`)
      })
      break
  }
  return `${type.toUpperCase()}(${wktCoords.join(',')})`
}

export function geojsonToWkt(geojson: GeojsonType) {
  if(!geojson) {
    console.log('没有数据');
    return
  }
  if (
    [
      'POINT',
      'LINESTRING',
      'POLYGON',
      'MULTIPOINT',
      'MULTILINESTRING',
      'MULTIPOLYGON',
    ].includes(geojson.type.toUpperCase())
  ) {
    return geometryToWkt(geojson as GeometryType)
  } else if (geojson.type.toUpperCase() === 'FEATURE') {
    return geometryToWkt(geojson.geometry as GeometryType)
  } else if (geojson.type.toUpperCase() === 'GEOMETRYCOLLECTION') {
    const wkts: string[] = []
    geojson.geometries?.forEach((item) => {
      wkts.push(geometryToWkt(item))
    })
    return `GEOMETRYCOLLECTION(${wkts.join(',')})`
  } else if (geojson.type.toUpperCase() === 'FEATURECOLLECTION') {
    const wkts: string[] = []
    geojson.features?.forEach((item) => {
      wkts.push(geometryToWkt(item.geometry as GeometryType))
    })
    return `GEOMETRYCOLLECTION(${wkts.join(',')})`
  } else {
    console.log('geojson没有type')
  }
}
