'use strict'

const Instagram = require('../../instagram');

const POST_SCHEMA = {
  schema: {
    summary: 'upload file',
    body: {
      type: 'object',
      properties: {
        imagen: { type: 'object' },
        texto: { type: 'string' },
        usuario: { type: 'string' },
        clave: { type: 'string' },
        telefono: { type: 'string' },
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
      const igm = new Instagram(usuario, clave);
      await igm.login();
      const { media } = await igm.post(texto, fileUrl);
      reply.send({ media })
      await igm.logout();
    })
  })
}
