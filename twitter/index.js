'use strict'
const fs = require('fs')
const puppeteer = require("puppeteer-core");

/** @type {puppeteer.Browser} */
let browser;

const NETWORK_IDLE = { waitUntil: "networkidle2" };
const DOM = require('./dom')

async function init() {
  console.log("INICIALIZANDO TWITTER");
  if (!browser) {
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS == 'true' ? true : false,
      executablePath: process.env.CHROME_EXE,
      userDataDir: process.env.CHROME_USER,
    });
  }
  return browser;
}
/**
 * @param {String} usuario 
 * @param {String} clave 
 * @param {String} telefono
 * @returns
 */
function page(usuario, clave, telefono) {
  return new Promise(async (resolve, reject) => {
    const pagina = await browser.newPage();
    await pagina.goto("https://twitter.com/login", NETWORK_IDLE);

    await iniciar_sesion(pagina, usuario, clave, telefono);

    resolve(pagina);
  }).catch(error => {
    console.log('error :>> ', error);
    reject(error)
  })
}

/**
 * @param {puppeteer.Page} pagina
 * @param {String} texto 
 * @param {String} imagenUri
 */
function post(pagina, texto, imagen) {
  return new Promise(async (resolve, reject) => {
    if (!texto || texto.length == 0) return reject('No se ha indicado texto a publicar')
    if (!fs.existsSync(imagen)) return reject(`Imagen ${imagenUri} no existe`)

    await Promise.all([
      pagina.waitForNavigation(NETWORK_IDLE),
      pagina.click(DOM.POST_BUTTON),
    ])

    const uploadInput = await pagina.waitForSelector(DOM.UPLOAD_INPUT);
    uploadInput.uploadFile(imagen);

    await pagina.type(DOM.MESSAGE_INPUT, texto);
    await Promise.all([
      pagina.waitForNavigation(NETWORK_IDLE),
      pagina.click(DOM.POST_SUBMIT)
    ])

    const ultimoPost = await pagina.$eval(DOM.POST_LINKS, a => a.href);
    if (ultimoPost) {
      const postId = ultimoPost.split("/").pop();
      resolve({
        postId,
        datetime: new Date().toISOString()
      })
    }

    await cerrarSesion(pagina);
    pagina.close();
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
    const solicitaTelefono = await pagina.$('#challenge_response')
    if (solicitaTelefono) {
      await solicitaTelefono.type(telefono);
      await Promise.all([
        pagina.waitForNavigation(NETWORK_IDLE),
        pagina.click('#email_challenge_submit')
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

module.exports = {
  init,
  page,
  post
}