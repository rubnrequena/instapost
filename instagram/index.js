const InstagramWeb = require('instagram-web-api');

class Instagram {
  constructor(username, password) {
    this.sesion = { username, password }
    this.client = new InstagramWeb(this.sesion)
  }

  login() {
    return this.client
      .login()
      .then(() => {
        return this.client
          .getProfile()
          .then(console.log)
      })
  }
  logout() {
    return this.client.logout();
  }

  post(mensaje, imagen) {
    return this.client.uploadPhoto({ photo: imagen, caption: mensaje, post: 'feed' })
  }
}
module.exports = Instagram