"use strict";function e(e){try{var o=e.match(/^[A-Z]+(?=\()/);if(!o)return void console.log("wkt数据格式不对,没有解析到type");var r=o[0],t=void 0;if("POINT"===r){if(!(a=e.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g)))return void console.log("没有解析到POINT的坐标");t={type:"Point",coordinates:s=a[0].split(" ").map(Number)}}else if("LINESTRING"===r){if(!(a=e.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g)))return void console.log("没有解析到LINESTRING的坐标");var n=[];a.forEach((function(e){n.push(e.split(" ").map(Number))})),t={type:"LineString",coordinates:n}}else if("MULTIPOINT"===r){var a;if(!(a=e.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g)))return void console.log("没有解析到MULTIPOINT的坐标");var i=[];a.forEach((function(e){i.push(e.split(" ").map(Number))})),t={type:"MultiPoint",coordinates:i}}else if("POLYGON"===r){for(var c=e.split(/,(?=\()/),s=[],l=function(e){var o=c[e].match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g);if(!o)return console.log("没有解析到POLYGON的坐标"),{value:void 0};var r=[];o.forEach((function(e){r.push(e.split(" ").map(Number))})),s.push(r)},u=0;u<c.length;u++){var f=l(u);if("object"==typeof f)return f.value}t={type:"Polygon",coordinates:s}}else if("MULTILINESTRING"===r){c=e.split(/,(?=\()/),s=[];var p=function(e){var o=c[e].match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g);if(!o)return console.log("没有解析到MULTILINESTRING的坐标"),{value:void 0};var r=[];o.forEach((function(e){r.push(e.split(" ").map(Number))})),s.push(r)};for(u=0;u<c.length;u++){var g=p(u);if("object"==typeof g)return g.value}t={type:"MultiLineString",coordinates:s}}else if("MULTIPOLYGON"===r){var h=e.split(/,(?=\(\()/);for(s=[],u=0;u<h.length;u++){for(var N=h[u].split(/,(?=\()/),v=[],I=function(e){var o=N[e].match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g);if(!o)return console.log("没有解析到MULTIPOLYGON的坐标"),{value:void 0};var r=[];o.forEach((function(e){r.push(e.split(" ").map(Number))})),v.push(r)},d=0;d<N.length;d++){var y=I(d);if("object"==typeof y)return y.value}s.push(v)}t={type:"MultiPolygon",coordinates:s}}return t}catch(e){console.log("格式解析出错",e)}}function o(e){var o=e.type;if(!o)return console.log("这个geometry没有type"),"";if("string"!=typeof o)return console.log("这个geometry的type不是字符串"),"";var r=e.coordinates;if(!r)return console.log("这个geometry没有coordinates"),"";if(!(r instanceof Array))return console.log("这个geometry的coordinates不是数组"),"";if(0===r.length)return console.log("这个geometry的coordinates是空的"),"";var t=[];switch(o.toUpperCase()){case"POINT":t.push(r.slice(0,2).join(" "));break;case"LINESTRING":case"MULTIPOINT":r.forEach((function(e){e instanceof Array&&t.push(e.slice(0,2).join(" "))}));break;case"POLYGON":case"MULTILINESTRING":r.forEach((function(e){var o=[];e instanceof Array&&e.forEach((function(e){e instanceof Array&&o.push(e.slice(0,2).join(" "))})),t.push("(".concat(o.join(","),")"))}));break;case"MULTIPOLYGON":r.forEach((function(e){var o=[];e instanceof Array&&e.forEach((function(e){var r=[];e instanceof Array&&e.forEach((function(e){e instanceof Array&&r.push(e.slice(0,2).join(" "))})),o.push("(".concat(r.join(","),")"))})),t.push("(".concat(o.join(","),")"))}));break;default:return console.log("这个geojson的type值好像不太对--\x3e",o),""}return"".concat(o.toUpperCase(),"(").concat(t.join(","),")")}exports.geojsonToWkt=function(e){var r,t;if(!e)return console.log("没有geojson数据"),"";var n=e.type;if(!n)return console.log("这个geojson没有type"),"";if("string"!=typeof n)return console.log("这个geojson的type不是字符串"),"";if(["POINT","LINESTRING","POLYGON","MULTIPOINT","MULTILINESTRING","MULTIPOLYGON"].includes(n.toUpperCase()))return o(e);if("FEATURE"===n.toUpperCase())return o(e.geometry);if("GEOMETRYCOLLECTION"===n.toUpperCase()){var a=[];return null===(r=e.geometries)||void 0===r||r.forEach((function(e){a.push(o(e))})),"GEOMETRYCOLLECTION(".concat(a.join(","),")")}if("FEATURECOLLECTION"===n.toUpperCase()){var i=[];return null===(t=e.features)||void 0===t||t.forEach((function(e){i.push(o(e.geometry))})),"GEOMETRYCOLLECTION(".concat(i.join(","),")")}return console.log("这个geojson的type值好像不太对--\x3e",n),""},exports.wktToGeojson=function(o){try{var r=(o=o.replaceAll("\n","").replaceAll("  ","").replaceAll(" ,",",").replaceAll(", ",",").replaceAll(" (","(").replaceAll("( ","(").replaceAll(" )",")").replaceAll(") ",")").toUpperCase()).match(/^[A-Z]+(?=\()/);if(!r)return void console.log("wkt数据格式不对,没有解析到type");var t=r[0];if("GEOMETRYCOLLECTION"===t){for(var n=(o=o.substring(19,o.length-1)).split(/,(?=[A-Z]+)/),a=[],i=0;i<n.length;i++){if(!(c=e(n[i])))return;a.push({type:"Feature",geometry:c})}return{type:"FeatureCollection",features:a}}if((n=o.split(/,(?=[A-Z]+)/)).length>1){for(a=[],i=0;i<n.length;i++){if(!(c=e(n[i])))return;a.push({type:"Feature",geometry:c})}return{type:"FeatureCollection",features:a}}if(["POINT","LINESTRING","POLYGON","MULTIPOINT","MULTILINESTRING","MULTIPOLYGON"].includes(t)){var c;if(!(c=e(o)))return;return{type:"Feature",geometry:c}}return void console.log("wkt数据的type不太对--\x3e",t)}catch(e){console.log("格式解析出错",e)}};
