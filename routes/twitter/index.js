'use strict'

const twitter = require('../../twitter')
const TwitterPagina = require('../../twitter/twitter')

const POST_SCHEMA = {
  schema: {
    summary: 'upload file',
    body: {
      type: 'object',
      properties: {
        imagen: { type: 'object' },
        texto: { type: 'string' },
        usuario: { type: 'string' },
        clave: { type: 'string' }
      },
      required: ['imagen', 'texto']
    }
  }
}

module.exports = async function (fastify, opts) {
  fastify.post('/post', POST_SCHEMA, function (request, reply) {
    const { texto, usuario, clave, telefono } = request.body
    const file = request.raw.files.imagen
    const ext = file.name.split(".").pop()
    const fileName = `${file.md5}.${ext}`
    const fileUrl = `c:\\cache\\${fileName}`
    file.mv(fileUrl, async (err) => {
      if (err) {
        reply.send({ error: err });
        return;
      }
      const twitter = new TwitterPagina(usuario, clave, telefono)
      try {
        await twitter.iniciar();
        await twitter.post(texto, fileUrl);
        await twitter.close();
        reply.send(twitter.publicaciones);
      } catch (error) {
        console.log('error :>> ', error);
        twitter.close();
      }
    })
  })
}
