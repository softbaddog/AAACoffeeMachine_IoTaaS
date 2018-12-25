const crypto = require('crypto');

// 加密
function genSign(src, key, iv) {
  let sign = '';
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  sign += cipher.update(src, 'utf8', 'hex');
  sign += cipher.final('hex');
  return sign;
}

// 解密
function deSign(sign, key, iv) {
  let src = '';
  const cipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  src += cipher.update(sign, 'hex', 'utf8');
  src += cipher.final('utf8');
  return src;
}

const key = Buffer.from('9vApxLk5G3PAsJrM', 'utf8');
const iv = Buffer.from('FnJL7EDzjqWjcaY9', 'utf8');
const sign = genSign('ce791182-e292-4402-b2de-1c38e6b96aba', key, iv);
console.log(sign); // 764a669609b0c9b041faeec0d572fd7a


// 解密
// const key = Buffer.from('9vApxLk5G3PAsJrM', 'utf8');
// const iv = Buffer.from('FnJL7EDzjqWjcaY9', 'utf8');
const src=deSign('1371fbd7d90d5754013b330ddd2ac1b154ff4a459f4b930a5b5f8071ed8623f3cc3c7fb9ce114ec42ec8f27d47b85c1a', key, iv);
console.log(src); // hello world

