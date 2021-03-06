'use strict'

const twitter = require('../../twitter')
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
      },
      required: ['texto', 'usuario', 'clave', 'telefono']
    }
  }
}

module.exports = async function (fastify, opts) {
  fastify.post('/post', POST_SCHEMA, async function (request, reply) {
    const { texto, usuario, clave, telefono } = request.body;
    let fileUrl;
    if (request.raw.files) {
      fileUrl = await moverArchivo(request.raw.files.imagen);
    }
    const twitter = new TwitterPagina(usuario, clave, telefono)
    try {
      await twitter.iniciar();
      await twitter.post(texto, fileUrl);
      reply.send(twitter.publicaciones);
      twitter.close();
    } catch (error) {
      console.log('error :>> ', error);
      await twitter.screenshot('ultimo_error');
      twitter.close();
    }
  })
}

function moverArchivo(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop()
    const fileName = `${file.md5}.${ext}`
    const fileUrl = `c:\\cache\\${fileName}`
    file.mv(fileUrl, async (err) => {
      if (err) return reject(err)
      resolve(fileUrl)
    })
  });
}
