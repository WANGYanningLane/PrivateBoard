var level = require('level');
const db = level(__dirname + '/data'); //这里的路径就是物理存储数据的文件路径,建议不要放到项目中.

function put(key, value, callback) {
    if (key && value) {
        db.put(key, value, function (error) {
            callback(error);
        })
    } else {
        callback('no key or value');
    }
}

function get(key, callback) {
    if (key) {
        db.get(key, function (error, value) {
            callback(error, value);
        })
    } else {
        callback('no key', key);
    }
}

function del(key, callback) {
    if (key) {
        db.del(key, function (error) {
            callback(error);
        })
    } else {
        callback('no key');
    }
}

function batch(batchList, callback) {
    if (Array.isArray(batchList)) {
        if (batchList && batchList.length > 0) {
            db.batch(batchList, function (error) {
                callback(error, batchList);
            })
        } else {
            callback('array Member format error');
        }
    } else {
        callback('not array');
    }
}

function find(find, callback) {
    var option = {keys: true, values: true, revers: false, fillCache: true};
    if (!find)
        return callback('nothing', null);
    else {
        if (find.prefix) {
            option.start = find.prefix;
            option.end = find.prefix.substring(0, find.prefix.length - 1)
                + String.fromCharCode(find.prefix[find.prefix.length - 1].charCodeAt() + 1);
        }

        if (find.limit)
            option.limit = find.limit;

        db.createReadStream(option).on('data', function (data) {
            data&&callback(data.key, data.value);
        }).on('error',function (err) {
            }).on('close',function () {
            }).on('end', function () {
                return callback(null, Date.now());
            });
    }
}

exports.put = put;
exports.get = get;
exports.del = del;
exports.find = find;
exports.batch = batch;