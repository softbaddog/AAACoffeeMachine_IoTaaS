
var data = "Machine_Close";

var buf = Buffer.from(data);

var temp = "";
for (const b of buf) {
  temp += b.toString(16) + " ";
}

console.log(temp);