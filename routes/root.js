'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/instagram/post', function (request, reply) {
    reply.type('text/html').send(`
    <form action="/post" method="post" enctype="multipart/form-data">
      <input type="file" name="imagen">
      <input type="text" name="texto" value="world">
      <input type="text" name="usuario">
      <input type="text" name="clave">
      <input type="submit" value="Publicar">
    </form>
    `)
  })
  fastify.get('/twitter/post', function (request, reply) {
    reply.type('text/html').send(`
    <form action="/twitter/post" method="post" enctype="multipart/form-data">
      <div>
        <label>Publicacion</label>
        <input type="text" name="texto" value="">  
      </div>
      <div>
        <label>Usuario</label>
        <input type="text" name="usuario">
      </div>
      <div>
      <label>Telefono</label>
      <input type="text" name="telefono"></div>
      <div>
      <label>Clave</label>
      <input type="text" name="clave"></div>
      <div>
      <label>Imagen</label>
      <input type="file" name="imagen"></div>
      <input type="submit" value="Publicar">
    </form>
    `)
  })
}