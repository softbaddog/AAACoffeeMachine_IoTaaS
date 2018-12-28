var data = `82a66d6574686f64a96f7065726174696f6ea46461746181a46865616401`;

var buf = Buffer.from(data,'hex');
console.log(buf.toString('base64'));


// // var temp = "";
// // for (const b of buf) {
// //   temp += b.toString(16) + " ";
// // }

// var json = JSON.parse(data);

// console.log(JSON.stringify(json));