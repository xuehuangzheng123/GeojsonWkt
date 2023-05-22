"use strict";function e(e){try{var t=e.match(/^[A-Z]+(?=\()/)[0],o=void 0;if("POINT"===t)o={type:"Point",coordinates:(r=e.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g))[0].split(" ").map(Number)};else if("LINESTRING"===t){var r=e.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g),n=[];null==r||r.forEach((function(e){n.push(e.split(" ").map(Number))})),o={type:"LineString",coordinates:n}}else if("MULTIPOINT"===t){r=e.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g);var a=[];null==r||r.forEach((function(e){a.push(e.split(" ").map(Number))})),o={type:"MultiPoint",coordinates:a}}else if("POLYGON"===t){var c=e.split(/,(?=\()/),i=[];c.forEach((function(e){var t=e.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g),o=[];null==t||t.forEach((function(e){o.push(e.split(" ").map(Number))})),i.push(o)})),o={type:"Polygon",coordinates:i}}else if("MULTILINESTRING"===t){c=e.split(/,(?=\()/);var s=[];c.forEach((function(e){var t=e.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g),o=[];null==t||t.forEach((function(e){o.push(e.split(" ").map(Number))})),s.push(o)})),o={type:"MultiLineString",coordinates:s}}else if("MULTIPOLYGON"===t){var l=e.split(/,(?=\(\()/),u=[];l.forEach((function(e){var t=e.split(/,(?=\()/);console.log(t);var o=[];t.forEach((function(e){var t=e.match(/(-*\d+\.*\d*\s-*\d+\.*\d*)/g),r=[];null==t||t.forEach((function(e){r.push(e.split(" ").map(Number))})),o.push(r)})),u.push(o)})),o={type:"MultiPolygon",coordinates:u}}return o}catch(e){console.log("格式解析出错",e)}}function t(e){var t=e.type,o=e.coordinates,r=[];switch(t.toUpperCase()){case"POINT":r.push(o.slice(0,2).join(" "));break;case"LINESTRING":case"MULTIPOINT":o.forEach((function(e){e instanceof Array&&r.push(e.slice(0,2).join(" "))}));break;case"POLYGON":case"MULTILINESTRING":o.forEach((function(e){var t=[];e instanceof Array&&e.forEach((function(e){e instanceof Array&&t.push(e.slice(0,2).join(" "))})),r.push("(".concat(t.join(","),")"))}));break;case"MULTIPOLYGON":o.forEach((function(e){var t=[];e instanceof Array&&e.forEach((function(e){var o=[];e instanceof Array&&e.forEach((function(e){e instanceof Array&&o.push(e.slice(0,2).join(" "))})),t.push("(".concat(o.join(","),")"))})),r.push("(".concat(t.join(","),")"))}))}return"".concat(t.toUpperCase(),"(").concat(r.join(","),")")}exports.geojsonToWkt=function(e){var o,r;if(e){if(["POINT","LINESTRING","POLYGON","MULTIPOINT","MULTILINESTRING","MULTIPOLYGON"].includes(e.type.toUpperCase()))return t(e);if("FEATURE"===e.type.toUpperCase())return t(e.geometry);if("GEOMETRYCOLLECTION"===e.type.toUpperCase()){var n=[];return null===(o=e.geometries)||void 0===o||o.forEach((function(e){n.push(t(e))})),"GEOMETRYCOLLECTION(".concat(n.join(","),")")}if("FEATURECOLLECTION"===e.type.toUpperCase()){var a=[];return null===(r=e.features)||void 0===r||r.forEach((function(e){a.push(t(e.geometry))})),"GEOMETRYCOLLECTION(".concat(a.join(","),")")}console.log("geojson没有type")}else console.log("没有数据")},exports.wktToGeojson=function(t){try{var o=(t=t.replaceAll("\n","").replaceAll("  ","").replaceAll(" ,",",").replaceAll(", ",",").replaceAll(" (","(").replaceAll("( ","(").replaceAll(" )",")").replaceAll(") ",")")).match(/^[A-Z]+(?=\()/)[0];if("GEOMETRYCOLLECTION"===o){for(var r=(t=t.substring(19,t.length-1)).split(/,(?=[A-Z]+)/),n=[],a=0;a<r.length;a++){if(!(c=e(r[a])))return;n.push({type:"Feature",geometry:c})}return{type:"FeatureCollection",features:n}}if((r=t.split(/,(?=[A-Z]+)/)).length>1){for(n=[],a=0;a<r.length;a++){var c;if(!(c=e(r[a])))return;n.push({type:"Feature",geometry:c})}return{type:"FeatureCollection",features:n}}if(["POINT","LINESTRING","POLYGON","MULTIPOINT","MULTILINESTRING","MULTIPOLYGON"].includes(o))return{type:"Feature",geometry:e(t)}}catch(e){console.log("格式解析出错",e)}};
