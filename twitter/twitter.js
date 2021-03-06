'use strict';
const fs = require('fs')
const puppeteer = require('puppeteer-core');

const DOM = require('./dom');

const NETWORK_IDLE = { waitUntil: "networkidle2" };

class TwitterPagina {
  /** @type {puppeteer.Page} */
  pagina
  /** @type {puppeteer.Browser} */
  navegador

  usuario
  clave
  telefono

  /** @type {Post[]} */
  publicaciones = []

  /**
   * @param {String} usuario 
   * @param {String} clave 
   * @param {String} telefono 
   */
  constructor(usuario, clave, telefono) {
    this.usuario = usuario;
    this.clave = clave;
    this.telefono = telefono;
  }
  /** 
   * @returns {Promise<TwitterPagina>}
  */
  async iniciar() {
    this.navegador = await puppeteer.launch({
      headless: process.env.HEADLESS == 'true' ? true : false,
      executablePath: process.env.CHROME_EXE
    })
    this.pagina = await this.navegador.newPage()
    await this.pagina.goto("https://twitter.com/login", NETWORK_IDLE);
    await iniciar_sesion(this.pagina, this.usuario, this.clave, this.telefono)
    return this;
  }

  /** 
   * @param {String} texto
   * @param {String} imagen
   * @returns {Promise<Post>}
  */
  post(texto, imagen) {
    return new Promise(async (resolve, reject) => {
      if (!texto || texto.length == 0) return reject('No se ha indicado texto a publicar')
      if (imagen)
        if (!fs.existsSync(imagen)) return reject(`Imagen ${imagenUri} no existe`)

      await Promise.all([
        this.pagina.waitForNavigation(NETWORK_IDLE),
        this.pagina.goto('https://twitter.com/compose/tweet'),
      ])
      if (imagen) {
        const uploadInput = await this.pagina.waitForSelector(DOM.UPLOAD_INPUT);
        uploadInput.uploadFile(imagen);
      }
      console.log('Escribiendo >', texto, 'en', this.usuario);
      await this.pagina.type(DOM.MESSAGE_INPUT, texto)

      await this.pagina.click(DOM.POST_SUBMIT)

      const alert = await this.pagina.$(DOM.ALERT);
      if (alert) {
        console.error('Error al publicar, intentalo nuevamente');
        await this.pagina.waitForTimeout(2000);
        await this.pagina.click(DOM.POST_SUBMIT);
      }
      this.pagina.waitForNavigation(NETWORK_IDLE).finally(async () => {
        await this.pagina.waitForSelector(DOM.POST_LINKS)
        const ultimoPost = await this.pagina.$eval(DOM.POST_LINKS, a => a.href);
        if (ultimoPost) {
          const postId = ultimoPost.split("/").pop();
          this.publicaciones.push({
            postId,
            datetime: new Date().toISOString()
          })
          resolve(this)
        }
      })
    });
  }

  async close() {
    await cerrarSesion(this.pagina)
    await this.pagina.close();
    await this.navegador.close();
  }

  async screenshot(label) {
    await this.pagina.screenshot({ path: `${label}.png` });
  }
}

/**
 * @param {puppeteer.Page} pagina 
 * @param {String} usuario
 * @param {String} clave
 * @param {String} telefono
 * @returns {Promise<puppeteer.Page>}
 */
function iniciar_sesion(pagina, usuario, clave, telefono) {
  return new Promise(async (resolve, reject) => {
    const postBoton = await pagina.$(DOM.POST_BUTTON);
    if (postBoton) return resolve(pagina)
    await pagina.type(DOM.USUARIO_INPUT, usuario);
    await pagina.type(DOM.CLAVE_INPUT, clave);
    await Promise.all([
      pagina.click(DOM.SESSION_SUBMIT),
      pagina.waitForNavigation(NETWORK_IDLE)
    ])
    const solicitaTelefono = await pagina.$(DOM.PIDE_TELEFONO)
    if (solicitaTelefono) {
      await solicitaTelefono.type(telefono);
      await Promise.all([
        pagina.waitForNavigation(NETWORK_IDLE),
        pagina.click(DOM.ENVIA_TELEFONO)
      ])
    }
    const usuario_input = await pagina.$(DOM.USUARIO_INPUT);
    if (usuario_input) {
      await pagina.type(DOM.USUARIO_INPUT, telefono);
      await pagina.type(DOM.CLAVE_INPUT, clave);
      await Promise.all([
        pagina.click(DOM.SESSION_SUBMIT),
        pagina.waitForNavigation(NETWORK_IDLE)
      ])
    }
    const acceso_cuenta = await pagina.$(DOM.ACCESO_CUENTA);
    if (acceso_cuenta) {
      const submit = await acceso_cuenta.$('input.Button');
      await Promise.all([
        submit.click(),
        pagina.waitForNavigation(NETWORK_IDLE)
      ])
    }
    resolve(pagina);
  });
}

/**
 * @param {puppeteer.Page} pagina
 */
function cerrarSesion(pagina) {
  return Promise.all([
    pagina.waitForNavigation(NETWORK_IDLE),
    pagina.goto('https://twitter.com/logout'),
  ]).then(() => {
    return Promise.all([
      pagina.waitForNavigation(NETWORK_IDLE),
      pagina.click(DOM.CONFIRMAR_CERRAR_SESION)
    ])
  })
}
module.exports = TwitterPagina;

class Post {
  /** @type {String} */postId
  /** @type {String} */datetime
}