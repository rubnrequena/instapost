'use strict'

const path = require('path');
const TwitterPagina = require('../../twitter/twitter')

const POST_SCHEMA = {
  schema: {
    summary: 'upload file',
    body: {
      type: 'object',
      properties: {
        imagen: { type: "object" },
        texto: { type: 'string' },
        usuario: { type: 'string' },
        clave: { type: 'string' },
        telefono: { type: 'string' },
        correo: { type: 'string' },
      },
      required: ['texto', 'usuario', 'clave', 'telefono', 'correo']
    }
  }
}

module.exports = async function (fastify, opts) {
  fastify.post('/post', POST_SCHEMA, async function (request, reply) {
    const { texto, usuario, clave, telefono, correo } = request.body;
    let fileUrl;
    if (request.raw.files) {
      fileUrl = await moverArchivo(request.raw.files.imagen);
    }
    const twitter = new TwitterPagina(usuario, clave, telefono, correo)
    try {
      await twitter.iniciar();
      await twitter.post(texto, fileUrl).catch(e => {
        console.log('error :>> ', error);
        twitter.screenshot('ultimo_error')
      })
      reply.send(twitter.publicaciones);
      await twitter.close();
    } catch (error) {
      reply.send({ error: 'ocurrio un error' });
      console.log('error :>> ', error);
      await twitter.close();
    }
  })
}

function moverArchivo(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop()
    const fileName = `${file.md5}.${ext}`
    const fileUrl = path.resolve(`cache/${fileName}`)
    file.mv(fileUrl, async (err) => {
      if (err) return reject(err)
      resolve(fileUrl)
    })
  });
}
