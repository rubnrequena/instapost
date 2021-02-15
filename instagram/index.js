const InstagramWeb = require('instagram-web-api');

class Instagram {
  constructor(username, password) {
    this.sesion = { username, password }
    this.client = new InstagramWeb(this.sesion)
  }

  login() {
    return this.client.login()
  }
  logout() {
    return this.client.logout();
  }
  getProfile() {
    return this.client.getProfile();
  }

  async post(mensaje, imagen) {
    await this.login();
    console.log('Login > OK');
    const media = await this.client.uploadPhoto({ photo: imagen, caption: mensaje, post: 'feed' });
    console.log('Post > OK');
    return media;
  }
}
module.exports = Instagram