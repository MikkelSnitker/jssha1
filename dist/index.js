"use strict";
var POW_2_24 = Math.pow(2, 24);
var POW_2_32 = Math.pow(2, 32);
function lrot(n, bits) {
    return ((n << bits) | (n >>> (32 - bits)));
}
var Uint32ArrayBigEndian = (function () {
    function Uint32ArrayBigEndian(length) {
        this.bytes = new Uint8Array(length << 2);
    }
    Uint32ArrayBigEndian.prototype.get = function (index) {
        index <<= 2;
        return (this.bytes[index] * POW_2_24)
            + ((this.bytes[index + 1] << 16)
                | (this.bytes[index + 2] << 8)
                | this.bytes[index + 3]);
    };
    Uint32ArrayBigEndian.prototype.set = function (index, value) {
        var high = Math.floor(value / POW_2_24), rest = value - (high * POW_2_24);
        index <<= 2;
        this.bytes[index] = high;
        this.bytes[index + 1] = rest >> 16;
        this.bytes[index + 2] = (rest >> 8) & 0xFF;
        this.bytes[index + 3] = rest & 0xFF;
    };
    return Uint32ArrayBigEndian;
}());
exports.BLOCK_LENGTH = 64;
function hash(data) {
    var h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0, i, sbytes = data.byteLength, sbits = sbytes << 3, minbits = sbits + 65, bits = Math.ceil(minbits / 512) << 9, bytes = bits >>> 3, slen = bytes >>> 2, s = new Uint32ArrayBigEndian(slen), s8 = s.bytes, j, w = new Uint32Array(80), sourceArray = new Uint8Array(data);
    for (i = 0; i < sbytes; ++i) {
        s8[i] = sourceArray[i];
    }
    s8[sbytes] = 0x80;
    s.set(slen - 2, Math.floor(sbits / POW_2_32));
    s.set(slen - 1, sbits & 0xFFFFFFFF);
    for (i = 0; i < slen; i += 16) {
        for (j = 0; j < 16; ++j) {
            w[j] = s.get(i + j);
        }
        for (; j < 80; ++j) {
            w[j] = lrot(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
        }
        var a = h0, b = h1, c = h2, d = h3, e = h4, f, k, temp;
        for (j = 0; j < 80; ++j) {
            if (j < 20) {
                f = (b & c) | ((~b) & d);
                k = 0x5A827999;
            }
            else if (j < 40) {
                f = b ^ c ^ d;
                k = 0x6ED9EBA1;
            }
            else if (j < 60) {
                f = (b & c) ^ (b & d) ^ (c & d);
                k = 0x8F1BBCDC;
            }
            else {
                f = b ^ c ^ d;
                k = 0xCA62C1D6;
            }
            temp = (lrot(a, 5) + f + e + k + w[j]) & 0xFFFFFFFF;
            e = d;
            d = c;
            c = lrot(b, 30);
            b = a;
            a = temp;
        }
    }
    return new Uint8Array([(h0 + a), (h1 + b), (h2 + c), (h3 + d), (h4 + e)].reduce(function (result, int32, index) {
        result.push((int32 >>> 8 * 3) & 0xff);
        result.push((int32 >>> 8 * 2) & 0xff);
        result.push((int32 >>> 8 * 1) & 0xff);
        result.push((int32 >>> 8 * 0) & 0xff);
        return result;
    }, []));
}
exports.hash = hash;
//# sourceMappingURL=index.js.map