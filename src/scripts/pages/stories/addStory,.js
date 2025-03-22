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
          
          <video id="cameraPreview" autoplay playsinline class="camera-preview"></video>
          <button type="button" id="capturePhoto" class="capture-photo-button">Capture from Camera</button>
          <canvas id="canvas" class="canvas-hidden" style="display: none;"></canvas>

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
    const cameraPreview = document.getElementById("cameraPreview");
    const captureButton = document.getElementById("capturePhoto");
    const canvas = document.getElementById("canvas");
    let stream = null;

    if (L) {
      setTimeout(() => {
        const map = L.map("map").setView([-2.5489, 118.0149], 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        let marker;
        const customIcon = L.icon({
          iconUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        map.on("click", (event) => {
          const { lat, lng } = event.latlng;
          latInput.value = lat.toFixed(6);
          lonInput.value = lng.toFixed(6);
          if (marker) {
            marker.setLatLng([lat, lng]);
          } else {
            marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
          }
        });
      }, 300);
    }

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraPreview.srcObject = stream;
      } catch (error) {
        console.error("Error accessing camera:", error);
        message.innerHTML =
          "<span style='color: red;'>Camera access denied.</span>";
      }
    }

    function stopCamera() {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        cameraPreview.srcObject = null;
        stream = null;
      }
    }

    captureButton.addEventListener("click", () => {
      if (!stream) {
        startCamera();
        captureButton.textContent = "Ambil Gambar";
        return;
      }

      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = cameraPreview.videoWidth;
      canvas.height = cameraPreview.videoHeight;
      context.drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const file = new File([blob], "captured_photo.jpg", {
          type: "image/jpeg",
        });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        document.getElementById("photo").files = dataTransfer.files;
      });

      stopCamera();
      captureButton.textContent = "Capture from Camera";
    });

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

    window.addEventListener("hashchange", stopCamera);
  }
}
