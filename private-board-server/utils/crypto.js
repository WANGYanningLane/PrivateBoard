const crypto = require('crypto');

function sha256(inputStr) {
    var obj = crypto.createHash('sha256');
    obj.update(inputStr);
    return obj.digest('hex');
}

exports.sha256 = sha256;
