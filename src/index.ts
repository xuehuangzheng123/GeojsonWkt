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
    const typeStr = wkt.match(/^[A-Z]+(?=\()/)
    if (!typeStr) {
      console.log('wkt数据格式不对,没有解析到type')
      return
    }
    const type = typeStr[0]
    let geometry: GeometryType | undefined

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
      const features: FeatureType[] = []
      for (let i = 0; i < resArr.length; i++) {
        const geometry = wktToGeometry(resArr[i])
        if (!geometry) return
        features.push({ type: 'Feature', geometry })
      }
      return { type: 'FeatureCollection', features }
    } else {
      const resArr = wkt.split(/,(?=[A-Z]+)/)
      if (resArr.length > 1) {
        const features: FeatureType[] = []
        for (let i = 0; i < resArr.length; i++) {
          const geometry = wktToGeometry(resArr[i])
          if (!geometry) return
          features.push({ type: 'Feature', geometry })
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
function geometryToWkt(geometry: GeometryType) {
  const { type } = geometry
  if (!type) {
    console.log('这个geometry没有type')
    return ''
  }
  if (typeof type !== 'string') {
    console.log('这个geometry的type不是字符串')
    return ''
  }
  const coords = geometry.coordinates
  if (!coords) {
    console.log('这个geometry没有coordinates')
    return ''
  }
  if (!(coords instanceof Array)) {
    console.log('这个geometry的coordinates不是数组')
    return ''
  }
  if (coords.length === 0) {
    console.log('这个geometry的coordinates是空的')
    return ''
  }
  const wktCoords: string[] = []

  switch (type.toUpperCase()) {
    case 'POINT':
      wktCoords.push(coords.slice(0, 2).join(' '))
      break
    case 'LINESTRING':
    case 'MULTIPOINT':
      coords.forEach((item: any) => {
        item instanceof Array && wktCoords.push(item.slice(0, 2).join(' '))
      })
      break
    case 'POLYGON':
    case 'MULTILINESTRING':
      coords.forEach((item: any) => {
        const ringCoords: string[] = []
        item instanceof Array &&
          item.forEach((ele: any) => {
            ele instanceof Array && ringCoords.push(ele.slice(0, 2).join(' '))
          })
        wktCoords.push(`(${ringCoords.join(',')})`)
      })
      break
    case 'MULTIPOLYGON':
      coords.forEach((item: any) => {
        const polyCoords: string[] = []
        item instanceof Array &&
          item.forEach((ele: any) => {
            const ringCoords: string[] = []
            ele instanceof Array &&
              ele.forEach((mem: any) => {
                mem instanceof Array &&
                  ringCoords.push(mem.slice(0, 2).join(' '))
              })
            polyCoords.push(`(${ringCoords.join(',')})`)
          })
        wktCoords.push(`(${polyCoords.join(',')})`)
      })
      break
    default:
      console.log('这个geojson的type值好像不太对-->', type)
      return ''
  }
  return `${type.toUpperCase()}(${wktCoords.join(',')})`
}

export function geojsonToWkt(geojson: GeojsonType) {
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
    return geometryToWkt(geojson as GeometryType)
  } else if (type.toUpperCase() === 'FEATURE') {
    return geometryToWkt(geojson.geometry as GeometryType)
  } else if (type.toUpperCase() === 'GEOMETRYCOLLECTION') {
    const wkts: string[] = []
    geojson.geometries?.forEach((item) => {
      wkts.push(geometryToWkt(item))
    })
    return `GEOMETRYCOLLECTION(${wkts.join(',')})`
  } else if (type.toUpperCase() === 'FEATURECOLLECTION') {
    const wkts: string[] = []
    geojson.features?.forEach((item) => {
      wkts.push(geometryToWkt(item.geometry as GeometryType))
    })
    return `GEOMETRYCOLLECTION(${wkts.join(',')})`
  } else {
    console.log('这个geojson的type值好像不太对-->', type)
    return ''
  }
}

