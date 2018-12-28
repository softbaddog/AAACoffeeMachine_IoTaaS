var request = require('request');
var moment = require('moment');
var crypto = require('crypto');

const AK = "VWJDXW10MCBENASKJRW0";
// const AK = "DJZN5UEQSODCWJ7NGOMC";
const SK = "2HuetFIl9wWrBdpuoykTnnrHgGteyeUMtST4AXME";
// const SK = "vRNwGMd92PlityIO3daDseoS9hciL9xKSKkBiJ44";
const projectid = "70e38da67ab64bff9f434a026e25adc3";
// const projectid = "d575b0b740e54221aeb9a165653b103d";
const region = "cn-north-1";
const streamName = "dis-4mvu";
// const streamName = "test2";
const partitionId = 0;
const startingSequenceNumber = 0;
const x_sdk_date = moment().utc().format("YYYYMMDDTHHmmss") + 'Z';
// const x_sdk_date = '20181101T081630Z';

const HTTPRequestMethod = 'GET';
const Host = 'dis.cn-north-1.myhuaweicloud.com:20004';
const CanonicalURI = '/v2/' + projectid + '/cursors/';
// const CanonicalURI = '/v2/' + projectid + '/records/';
const CanonicalQuery = {
  'stream-name': streamName,
  'partition-id': partitionId,
  // 'cursor-type': 'AT_SEQUENCE_NUMBER',
  'cursor-type': 'TRIM_HORIZON',
  // 'starting-sequence-number': startingSequenceNumber
};
// const CanonicalQuery = {
//   'stream-name': streamName,
//   'partition-id': partitionId
// };
var CanonicalQueryString = jsonSort(CanonicalQuery);
console.log(CanonicalQueryString);
const CanonicalHeaders = 'host:'+ Host + '\nx-sdk-date:' + x_sdk_date + '\n';
console.log(CanonicalHeaders);
var SignedHeaders = 'host;x-sdk-date';

var CalculateContentHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
console.log("contentSha256::" + CalculateContentHash);
// var CalculateContentHash = 'af22378806bf4e69f5f1667877906e6ead78080cd859b4988ea6714dba6d1e02';
var CanonicalRequest = HTTPRequestMethod + '\n' + 
  CanonicalURI + '\n' + CanonicalQueryString +'\n' + 
  CanonicalHeaders + '\n' + SignedHeaders + '\n' + CalculateContentHash;

const hashCanonicalRequest = crypto.createHash('sha256');
const HashedCanonicalRequest = hashCanonicalRequest.update(CanonicalRequest).digest('hex');
console.log("CanonicalRequest=" + JSON.stringify(CanonicalRequest) + '\n');
// console.log("HashedCanonicalRequest=" + HashedCanonicalRequest + '\n');

var CredentialScope = moment(x_sdk_date).utc().format('YYYYMMDD') + '/' + region + '/dis/sdk_request';
var StringToSing = 'SDK-HMAC-SHA256' + '\n' + x_sdk_date + '\n' + CredentialScope + '\n' + HashedCanonicalRequest;
console.log("StringToSing=" + JSON.stringify(StringToSing) + '\n');

var kSecret = "SDK" + SK;
console.log("kSecret=" + kSecret);
var hmacDate = crypto.createHmac('sha256', kSecret);
var kDate = hmacDate.update(moment(x_sdk_date).utc().format('YYYYMMDD')).digest('hex');
console.log("kDate=" + kDate);
var hmacRegion = crypto.createHmac('sha256', Buffer.from(kDate, 'hex'));
var kRegion = hmacRegion.update(region).digest('hex');
console.log("kRegion=" + kRegion);
var hmacService = crypto.createHmac('sha256', Buffer.from(kRegion, 'hex'));
var kService = hmacService.update('dis').digest('hex');
console.log("kService=" + kService);
var hmacSigningKey  = crypto.createHmac('sha256', Buffer.from(kService, 'hex'));
var SigningKey = hmacSigningKey.update('sdk_request').digest('hex');
console.log("SigningKey=" + SigningKey + '\n');

var hmacSignature = crypto.createHmac('sha256', Buffer.from(SigningKey, 'hex'));
var Signature = hmacSignature.update(StringToSing).digest('hex');

console.log("Signature=" + Signature + '\n');

var options = {
  method: HTTPRequestMethod,
  url: 'https://' + Host + CanonicalURI,
  headers: {
    'Host': Host,
    'X-Sdk-Date': x_sdk_date,
    'Authorization': 'SDK-HMAC-SHA256 Credential=' + AK + '/' + moment(x_sdk_date).utc().format('YYYYMMDD') + '/' + region + '/dis/sdk_request' +
      ', SignedHeaders=' + SignedHeaders + ', Signature=' + Signature,

  },
  qs: CanonicalQuery,
  json: true
};
console.log(options);
request(options, function (error, res, body) {
  if (!error && res.statusCode == 200) {
    console.log(body);
  } else {
    console.error(body);
  }
});

function jsonSort(jsonObj) {
  let arr=[];
  for(var key in jsonObj){
      arr.push(key);
  }
  arr.sort();
  let str='';
  for(var i in arr){
     str +=arr[i]+"="+jsonObj[arr[i]]+"&";
  }
  return str.substr(0,str.length-1);
}