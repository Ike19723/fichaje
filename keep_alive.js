ver http = requre('http')

http.createServer(function (req, res) {
  res.write("im alive");
  res.end('hola')
}).listen(8080);
