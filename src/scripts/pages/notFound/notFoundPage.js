export default class NotFoundPage {
  async render() {
    return `
          <section class="container notfound-container">
            <h1 class="notfound-title">404 - Page Not Found</h1>
            <p class="notfound-text">The page you are looking for does not exist.</p>
            <a href="javascript:history.back()" class="notfound-link">
              <i class="fas fa-arrow-left"></i> Go Back
            </a>
          </section>
        `;
  }

  async afterRender() {
    // Tambahkan logika setelah render jika diperlukan
  }
}
