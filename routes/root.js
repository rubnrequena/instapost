'use strict'
const fetch = require('node-fetch').default;
const FormData = require('form-data')

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

  fastify.get('/test', function (request, reply) {
    const numMsg = Math.floor(Math.random() * 100)
    const macroguia = new FormData();
    //macroguia.append('imagen', undefined);
    macroguia.append('texto', `Hola para macroguia ${numMsg}`);
    macroguia.append('usuario', "macroguia");
    macroguia.append('clave', "rubn1987");
    macroguia.append('telefono', "rubnrequena@gmail.com");

    const sistemasrq = new FormData();
    //macroguia.append('imagen', undefined);
    sistemasrq.append('texto', `Hola para sistema SRQ ${numMsg}`);
    sistemasrq.append('usuario', "sistemassrq");
    sistemasrq.append('clave', "rub3n.1987");
    sistemasrq.append('telefono', "twitter@sistsmasrq.com");

    Promise.all([
      doFetch(macroguia),
      doFetch(sistemasrq)
    ]).then(res => {
      console.log('res :>> ', res);
      reply.send(res)
    })

    function doFetch(body) {
      return new Promise((resolve, reject) => {
        const host = process.env.FASTIFY_ADDRESS;
        const port = process.env.PORT;
        fetch(`http://${host}:${port}/twitter/post`, { method: 'POST', body })
          .then(res => res.json())
          .then(json => resolve(json));
      });
    }
  })
}