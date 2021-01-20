'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/post', function (request, reply) {
    reply.type('text/html').send(`
    <form action="/post" method="post" enctype="multipart/form-data">
      <input type="file" name="imagen">
      <input type="text" name="texto" value="world">
      <input type="text" name="usuario">
      <input type="text" name="clave">
      <input type="submit" value="Upload">
    </form>
    `)
  })
}