import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import Navbar from "../components/Navbar";

class App {
  #content = null;
  #navbar = new Navbar();
  #debounceTimeout = null;

  constructor({ content }) {
    this.#content = content;
    window.addEventListener("storage", this.#handleStorageChange.bind(this));
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url] || routes["*"];

    await this.renderNavbar();

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        this.addSkipToContentHandler();
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this.addSkipToContentHandler();
    }
  }

  async renderNavbar() {
    const header = document.querySelector("header");
    if (header) {
      header.innerHTML = await this.#navbar.render();
      await this.#navbar.afterRender();
    } else {
      console.warn("Header element not found");
    }
  }

  addSkipToContentHandler() {
    const skipLink = document.querySelector(".skip-to-content");
    const mainContent = document.getElementById("main-content");

    if (skipLink && mainContent) {
      skipLink.addEventListener("click", function (event) {
        event.preventDefault();
        mainContent.setAttribute("tabindex", "-1");
        mainContent.focus();
      });
    }
  }

  #handleStorageChange() {
    clearTimeout(this.#debounceTimeout);
    this.#debounceTimeout = setTimeout(() => this.renderNavbar(), 300);
  }
}

export default App;
