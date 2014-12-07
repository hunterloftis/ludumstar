var lz = require('lz-string');

module.exports = {
  send: function(ws, message) {
    if (ws.readyState !== 1) return;
    ws.send(message);
  },
  forceSend: function(ws, message) {
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
    return JSON.parse(uncompressed);
  }
};
