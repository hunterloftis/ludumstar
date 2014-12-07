var lz = require('lz-string');

var seconds = 0;
var sentSize = 0;
var receivedSize = 0;

module.exports = {
  send: function(ws, message) {
    if (ws.readyState !== 1) return;
    sentSize += message.length;
    ws.send(message);
  },
  forceSend: function(ws, message) {
    sentSize += message.length;
    ws.send(message);
  },
  pack: function(payload) {
    var string = JSON.stringify(payload);
    return string;
    //return lz.compressToUTF16(string);
  },
  unpack: function(compressed) {
    //var uncompressed = lz.decompressFromUTF16(compressed);
    var uncompressed = compressed;
    receivedSize += uncompressed.length;
    return JSON.parse(uncompressed);
  }
};

setInterval(function() {
  seconds++;
  console.log('seconds:', seconds, 'sent size (K):', Math.floor(sentSize / 1000), 'received size (K):', Math.floor(receivedSize / 1000));
}, 1000);
