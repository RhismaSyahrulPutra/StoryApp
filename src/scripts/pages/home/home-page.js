export default class HomePage {
  async render() {
    return `
      <section class="container home-container">
        <h1 class="home-title">STORY APP DICODING</h1>
        <p class="home-description">Welcome to Story App, where you can explore amazing stories and share your own!</p>
        <div class="home-buttons">
          <button id="loginButton" class="home-button login-button">Login</button>
          <button id="learnMoreButton" class="home-button learn-more-button">Learn More</button>
        </div>
      </section>
    `;
  }

  async afterRender() {
    document.getElementById("loginButton").addEventListener("click", () => {
      window.location.hash = "#/login";
    });

    document.getElementById("learnMoreButton").addEventListener("click", () => {
      window.location.hash = "#/about";
    });
  }
}
