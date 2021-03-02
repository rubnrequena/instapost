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
      },
      required: ['imagen', 'texto']
    }
  }
}

module.exports = async function (fastify, opts) {
  fastify.post('/post', POST_SCHEMA, function (request, reply) {
    const { texto, usuario, clave } = request.body
    const file = request.raw.files.imagen
    const ext = file.name.split(".").pop()
    const fileName = `${file.md5}.${ext}`
    const fileUrl = `c:\\cache\\${fileName}`
    file.mv(fileUrl, async (err) => {
      const igm = new Instagram(usuario, clave);
      igm.post(texto, fileUrl)
        .then(({ media }) => reply.send(media))
        .catch(error => {
          reply.type("text/html").send(error.error)
          console.error('ERROR:', error.error);
        })
    })
  })
}
