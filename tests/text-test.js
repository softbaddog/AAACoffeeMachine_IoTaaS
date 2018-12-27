
var data = `{
	"method": "keep-alive",
	"data": {
		"version": 0.1,
		"mode": 100,
		"timestamp": "1970-01-01 00:00:00 UTC",
		"params": {
			"IMSI": "8618912345678",
			"RSRP": -140,
			"ECL": 0,
			"SNR": 30,
			"CellID": 124481105
		}
	}
}`;

// var buf = Buffer.from(data);

// var temp = "";
// for (const b of buf) {
//   temp += b.toString(16) + " ";
// }

var json = JSON.parse(data);

console.log(JSON.stringify(json));