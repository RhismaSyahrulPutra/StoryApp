import { addNewStory } from "../../data/api";
import {
  addData,
  getData,
  deleteData,
  STORE_NAMES,
} from "../../utils/indexeddb";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default class AddStoryPage {
  async render() {
    return `
      <section class="container container-add-story">
        <h1 class="add-story-title">Add Story</h1>
        <form id="addStoryForm" class="add-story-form">
          <label for="description">Description:</label>
          <textarea id="description" name="description" required class="story-description"></textarea>

          <label for="photo"><i class="fa-solid fa-upload"></i> Upload Photo:</label>
          <input type="file" id="photo" name="photo" accept="image/*" required class="photo-upload" />

          <label for="map"><i class="fa-solid fa-map-marker-alt"></i> Select Location:</label>
          <div id="map" class="map-container"></div>

          <label for="lat">Latitude:</label>
          <input type="number" id="lat" name="lat" step="any" readonly class="lat-input" />

          <label for="lon">Longitude:</label>
          <input type="number" id="lon" name="lon" step="any" readonly class="lon-input" />

          <button type="submit" class="submit-story-button">
            <i class="fa-solid fa-paper-plane"></i> Submit
          </button>
        </form>
        <p id="message" class="response-message"></p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById("addStoryForm");
    const message = document.getElementById("message");
    const latInput = document.getElementById("lat");
    const lonInput = document.getElementById("lon");

    if (L) {
      setTimeout(() => {
        const map = L.map("map").setView([-2.5489, 118.0149], 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        let marker;
        map.on("click", (event) => {
          const { lat, lng } = event.latlng;
          latInput.value = lat.toFixed(6);
          lonInput.value = lng.toFixed(6);
          if (marker) {
            marker.setLatLng([lat, lng]);
          } else {
            marker = L.marker([lat, lng]).addTo(map);
          }
        });
      }, 300);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector(".submit-story-button");
      submitButton.disabled = true;

      const token = localStorage.getItem("token");
      if (!token) {
        message.innerHTML =
          "<span style='color: red;'>You must be logged in.</span>";
        submitButton.disabled = false;
        return;
      }

      const description = document.getElementById("description").value;
      const photo = document.getElementById("photo").files[0];
      const lat = parseFloat(latInput.value) || 0;
      const lon = parseFloat(lonInput.value) || 0;

      if (!description || !photo) {
        message.innerHTML =
          "<span style='color: red;'>Description and photo are required!</span>";
        submitButton.disabled = false;
        return;
      }

      try {
        const result = await addNewStory(token, description, photo, lat, lon);
        if (!result.error) {
          message.innerHTML =
            "<span style='color: green;'>Story added successfully!</span>";
          setTimeout(() => (window.location.hash = "#/stories"), 2000);
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        await addData(STORE_NAMES.USER_STORIES, {
          description,
          photo,
          lat,
          lon,
          createdAt: new Date().toISOString(),
        });
        message.innerHTML =
          "<span style='color: blue;'>No internet. Story saved offline!</span>";
      }
      submitButton.disabled = false;
    });
  }
}
