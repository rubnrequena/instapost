'use strict'

const twitter = require('../../twitter')

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
    file.mv(fileUrl, (err) => {
      twitter.init().then(navegador => {
        return twitter.page(usuario, clave, telefono).then(pagina => {
          return twitter.post(pagina, texto, fileUrl).then((post) => {
            console.log('Publicacion exitosa...', post);
            reply.send('Su publicacion esta siendo procesada');
          }).catch(error => console.error(error));
        })
      }).catch(error => {
        reply.send('⚠ Ha ocurrido un error durante la publicacion ⚠')
        console.log(error);
      })
    })
  })
}
