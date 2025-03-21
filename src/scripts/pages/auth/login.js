import { loginUser } from "../../data/api";

export default class LoginPage {
  async render() {
    return `
      <section class="container login-container">
        <h1>Login</h1>
        <form id="loginForm" class="login-form">
          <label for="email" class="form-label">Email:</label>
          <input type="email" id="email" name="email" class="form-input" required />
          
          <label for="password" class="form-label">Password:</label>
          <input type="password" id="password" name="password" class="form-input" required />
          
          <button type="submit" class="submit-button">Login</button>
        </form>
        <p id="error-message" class="error-message" style="color: red;"></p>
        <p class="signup-prompt">Belum punya akun? <a href="#/register" class="signup-link">Register di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("error-message");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorMessage.textContent = "";

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await loginUser(email, password);

        if (!response.loginResult || !response.loginResult.token) {
          throw new Error("Token tidak valid atau tidak ditemukan.");
        }

        localStorage.setItem("token", response.loginResult.token);
        window.location.href = "#/stories";
      } catch (error) {
        errorMessage.textContent = error.message;
      }
    });
  }
}
