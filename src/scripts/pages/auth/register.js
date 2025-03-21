import { registerUser } from "../../data/api";

export default class RegisterPage {
  async render() {
    return `
      <section class="container register-container">
        <h1 class="register-title">Register</h1>
        <form id="registerForm" class="register-form">
          <label for="name" class="form-label">Nama:</label>
          <input type="text" id="name" name="name" class="form-input" required />
          
          <label for="email" class="form-label">Email:</label>
          <input type="email" id="email" name="email" class="form-input" required />
          
          <label for="password" class="form-label">Password:</label>
          <input type="password" id="password" name="password" class="form-input" required minlength="8" />
          
          <button type="submit" class="submit-button">Register</button>
        </form>
        <p id="error-message" class="error-message" style="color: red;"></p>
        <p class="login-prompt">Sudah punya akun? <a href="#/login" class="login-link">Login di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    const registerForm = document.getElementById("registerForm");
    const errorMessage = document.getElementById("error-message");

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorMessage.textContent = "";

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await registerUser(name, email, password);
        alert("Registrasi berhasil! Silakan login.");
        window.location.href = "#/login";
      } catch (error) {
        errorMessage.textContent = error.message;
      }
    });
  }
}
