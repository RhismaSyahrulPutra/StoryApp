export default class Navbar {
  async render() {
    return `
      <div class="main-header container">
        <a class="brand-name" href="#/"><i class="fa-solid fa-book-open"></i> STORY APP DICODING</a>

        <nav id="navigation-drawer" class="navigation-drawer">
          <ul id="nav-list" class="nav-list"></ul>
        </nav>

        <button id="drawer-button" class="drawer-button" aria-label="Toggle navigation">
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    `;
  }

  async afterRender() {
    this.#updateNavLinks();
    this.#setupDrawer();
    this.#preventLoginRedirect();

    window.addEventListener("hashchange", () => this.#updateNavLinks());
  }

  #setupDrawer() {
    const drawerButton = document.querySelector("#drawer-button");
    const navigationDrawer = document.querySelector("#navigation-drawer");

    if (!drawerButton || !navigationDrawer) {
      console.warn("Drawer elements not found");
      return;
    }
    if (!drawerButton.dataset.listener) {
      drawerButton.addEventListener("click", (event) => {
        event.stopPropagation();
        navigationDrawer.classList.toggle("open");
      });

      document.body.addEventListener("click", (event) => {
        if (
          !navigationDrawer.contains(event.target) &&
          event.target !== drawerButton
        ) {
          navigationDrawer.classList.remove("open");
        }
      });

      navigationDrawer.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          navigationDrawer.classList.remove("open");
        });
      });

      drawerButton.dataset.listener = "true";
    }
  }

  #updateNavLinks() {
    const isLoggedIn = !!localStorage.getItem("token");
    const navList = document.querySelector("#nav-list");

    if (!navList) {
      console.warn("Navbar list element not found");
      return;
    }

    navList.innerHTML = isLoggedIn
      ? `
        <li><a href="#/stories"><i class="fa-solid fa-book"></i> Stories</a></li>
        <li><a href="#/notifications"><i class="fa-solid fa-bell"></i> Notifications</a></li>
        <li><a href="#" id="logoutLink" class="logout-link"><i class="fa-solid fa-right-from-bracket"></i> Logout</a></li>
      `
      : `
        <li><a href="#/"><i class="fa-solid fa-house"></i> Beranda</a></li>
        <li><a href="#/about"><i class="fa-solid fa-circle-info"></i> About</a></li>
        <li><a href="#/login"><i class="fa-solid fa-sign-in-alt"></i> Login/Register</a></li>
      `;

    if (isLoggedIn) {
      setTimeout(() => {
        const logoutLink = document.querySelector("#logoutLink");
        if (logoutLink) {
          logoutLink.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.removeItem("token");

            window.location.replace("#/login");

            this.#updateNavLinks();
          });
        }
      }, 0);
    }
  }

  #preventLoginRedirect() {
    const brandName = document.querySelector(".brand-name");
    if (brandName) {
      brandName.addEventListener("click", (event) => {
        const isLoggedIn = !!localStorage.getItem("token");
        if (isLoggedIn) {
          event.preventDefault();
          window.location.hash = "#/stories";
        }
      });
    }
  }
}
