'use strict'
const fs = require('fs')
const puppeteer = require("puppeteer-core");

const DOM = require("./typings/dom");
const { INICIO_SESION, ACEPTAR_COOKIES } = require("./typings/mensajes");

const DEVICE = puppeteer.devices[process.env.DEVICE];
const NETWORK_IDLE = { waitUntil: "networkidle2" };

/** @type {puppeteer.Browser} */
let browser;
async function init() {
  console.log("INICIALIZANDO NAVEGADOR");
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROME_EXE,
      userDataDir: process.env.CHROME_USER,
    });
  }
  return browser;
}
/**
 * 
 * @param {String} usuario 
 * @param {String} clave 
 * @returns
 */
function page(usuario, clave) {
  return new Promise(async (resolve, reject) => {
    const pagina = await browser.newPage();
    await pagina.emulate(DEVICE);
    await pagina.goto("https://instagram.com", NETWORK_IDLE);

    await aceptarCookies(pagina);
    rechazarPantallaInicio(pagina);
    rechazarNotificaciones(pagina);

    const postButton = await pagina.$(
      DOM.POST_BUTTON
    );
    if (postButton) {
      console.log('Sesion iniciada! 🚀');
      return resolve(pagina);
    }

    console.log(INICIO_SESION);

    const botonEntrar = await pagina.waitForSelector(DOM.BOTON_ENTRAR)
    await botonEntrar.click();

    const login = await pagina.$('#loginForm');
    if (login) {
      console.log('ingresando datos de sesion');
      await pagina.type(
        "#loginForm > div.Igw0E.IwRSH.eGOV_._4EzTm.kEKum > div:nth-child(3) > div > label > input",
        usuario
      );
      await pagina.type(
        "#loginForm > div.Igw0E.IwRSH.eGOV_._4EzTm.kEKum > div:nth-child(4) > div > label > input",
        clave
      );
      await pagina.click(
        "#loginForm > div.Igw0E.IwRSH.eGOV_._4EzTm.kEKum > div:nth-child(6) > button"
      );
      await pagina.waitForNavigation(NETWORK_IDLE);

      console.log('RECHAZANDO GUARDAR SESION')
      const noGuardarSesion = await pagina.waitForSelector(DOM.RECHAZAR_GUARDAR_SESION)
      await noGuardarSesion.click()
      console.log('Sesion iniciada con exito..');
      resolve(pagina);
    } else {
      console.log('Sesion iniciada')
      resolve(pagina);
    }
  });
}
/**
 * @param {puppeteer.Page} pagina 
 */
function aceptarCookies(pagina) {
  return new Promise(async (resolve) => {
    const html = await pagina.content();
    if (html.indexOf(ACEPTAR_COOKIES) > -1) {
      console.log('🍪 Aceptando cookies del navegador');
      await pagina.click(DOM.ACEPTAR_COOKIES_BTN)
      console.log('🍪 Cookies aceptadas');
      resolve();
    } else resolve()
  });
}
/**
 * @param {puppeteer.Page} pagina 
 */
function rechazarPantallaInicio(pagina) {
  let intentos = 0;
  const timer = setInterval(async () => {
    const html = await pagina.content()
    if (html.indexOf('Añadir a pantalla de inicio') > -1) {
      console.log('Rechazando añadir a pantalla de inicio');
      await pagina.click(DOM.RECHAZAR_MODAL);
      clearInterval(timer)
    } else {
      if (intentos++ > 10) clearInterval(timer)
    }
  }, 1000);
}
/**
 * @param {puppeteer.Page} pagina 
 */
function rechazarNotificaciones(pagina) {
  let intentos = 0
  const timer = setInterval(async () => {
    const html = await pagina.content()
    if (html.indexOf('Activar notificaciones') > -1) {
      console.log('Rechazando notificaciones');
      await pagina.click(DOM.RECHAZAR_MODAL);
      clearInterval(timer);
    } else {
      if (intentos++ > 10) clearInterval(timer)
    }
  }, 1000);
}
/**
 * @param {puppeteer.Page} pagina 
 */
function cerrarSesion(pagina) {
  return new Promise(async (resolve, reject) => {
    console.log('Ir a la pagina de usuario');
    const botonUsuario = await pagina.waitForSelector(DOM.BOTON_USUARIO)
    await botonUsuario.click();
    console.log('Abriendo menu de usuario');
    const menuUsuario = await pagina.waitForSelector(DOM.MENU_USUARIO)
    await menuUsuario.click();
    console.log('Cerrando sesion');
    const botonCerrar = await pagina.waitForSelector(DOM.CERRAR_SESION)
    const timer = setInterval(() => botonCerrar.click(), 1000);
    console.log('Confirmando cierre de sesion');
    const aceptarBoton = await pagina.waitForSelector(DOM.ACEPTAR_MODAL)
    clearInterval(timer);
    aceptarBoton.click();
    await pagina.waitForNavigation(NETWORK_IDLE)
    resolve();
  });
}

/**
 * @param {puppeteer.Page} pagina
 * @param {String} texto 
 * @param {String} imagenUri 
 * @returns Promise
 */
function post(pagina, texto, imagen) {
  return new Promise(async (resolve, reject) => {

    if (!texto || texto.length == 0) return reject('No se ha indicado texto a publicar')
    const imagenUri = `C:\\cache\\${imagen}`
    if (!fs.existsSync(imagenUri)) return reject(`Imagen ${imagenUri} no existe`)
    pagina.bringToFront();

    const postBoton = await pagina.waitForSelector(DOM.POST_BUTTON);

    const [fileChooser] = await Promise.all([
      pagina.waitForFileChooser(),
      postBoton.click()
    ]);
    await fileChooser.accept([imagenUri]);

    const siguiente =
      "#react-root > section > div.Scmby > header > div > div.mXkkY.KDuQp > button";
    await pagina.waitForSelector(siguiente);
    await pagina.click(siguiente);

    const mensajeInput =
      "#react-root > section > div.A9bvI > section.IpSxo > div.NfvXc > textarea";
    await pagina.waitForSelector(mensajeInput);
    await pagina.type(mensajeInput, texto);

    await pagina.click(
      "#react-root > section > div.Scmby > header > div > div.mXkkY.KDuQp > button"
    );

    await pagina.waitForNavigation(NETWORK_IDLE)

    await pagina.waitForSelector(DOM.ULTIMO_POST);
    const ultimoPost = await pagina.$eval(DOM.ULTIMO_POST, (a => {
      return {
        url: a.href,
        datetime: a.querySelector('time').dateTime
      }
    }))

    resolve(ultimoPost);
    await cerrarSesion(pagina);
    await pagina.close();
  });
}
module.exports = {
  init,
  page,
  post
}