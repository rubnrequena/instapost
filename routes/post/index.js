'use strict'

const igm = require('../../instagram')

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
        correo: { type: 'string' },
      },
      required: ['imagen', 'texto']
    }
  }
}

module.exports = async function (fastify, opts) {
  fastify.post('/', POST_SCHEMA, function (request, reply) {
    const { texto, usuario, clave, correo } = request.body
    const file = request.raw.files.imagen
    const ext = file.name.split(".").pop()
    const fileName = `${file.md5}.${ext}`
    file.mv(`c:\\cache\\${fileName}`, (err) => {
      igm.init().then(navegador => {
        return igm.page(usuario, clave, correo).then(pagina => {
          reply.send('Su publicacion esta siendo procesada')
          return igm.post(pagina, texto, fileName).then((post) => {
            console.log('Publicacion exitosa...', post);
          })
        })
      }).catch(error => reply.send({ error }))
    })
  })
}
