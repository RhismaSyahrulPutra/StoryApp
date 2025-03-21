import { getStoryDetail } from "../../data/api";
import { addData, getData, STORE_NAMES } from "../../utils/indexeddb";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default class StoriesDetailPage {
  async render() {
    return `
      <section class="container container-detail-story">
        <div class="story-detail-header">
          <img id="storyImage" class="story-image" alt="Story Image" />
          <h1 id="storyTitle" class="story-title">Memuat detail cerita...</h1>
        </div>
        <div id="storyDescription" class="story-description">Memuat deskripsi...</div>
        <div id="storyCreatedAt" class="story-created-at"></div>
        <div id="map" class="story-map-container"></div>
        <div id="storyLocation" class="story-location"></div>
        <button id="backButton" class="back-button">Kembali</button>
      </section>
    `;
  }

  async afterRender() {
    const storyDetailContainer = document.getElementById("storyDescription");
    const mapContainer = document.getElementById("map");
    const storyTitle = document.getElementById("storyTitle");
    const storyImage = document.getElementById("storyImage");
    const storyCreatedAt = document.getElementById("storyCreatedAt");
    const storyLocation = document.getElementById("storyLocation");

    const url = window.location.hash;
    const splitUrl = url.split("/");
    const storyId = splitUrl.length > 2 ? splitUrl[2] : null;

    if (!storyId) {
      storyDetailContainer.innerHTML = `<p class="error-message">ID cerita tidak valid.</p>`;
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.hash = "#/login";
        return;
      }

      let response;
      try {
        response = await getStoryDetail(storyId, token);
        if (response && response.story) {
          await addData(STORE_NAMES.USER_STORIES, response.story);
        }
      } catch (error) {
        console.warn(
          "Gagal mengambil data dari API, mencoba dari IndexedDB..."
        );
        response = { story: await getData(STORE_NAMES.USER_STORIES, storyId) };
      }

      if (!response || !response.story) {
        storyDetailContainer.innerHTML = `<p class="error-message">Detail cerita tidak ditemukan.</p>`;
        return;
      }

      const { name, description, photoUrl, createdAt, lat, lon } =
        response.story;

      storyTitle.innerHTML = name;
      storyDescription.innerHTML = description;
      storyImage.src = photoUrl;
      storyImage.alt = name;
      storyCreatedAt.innerHTML = `<p><small>Dibuat pada: ${new Date(
        createdAt
      ).toLocaleString()}</small></p>`;
      storyLocation.innerHTML = `
        <p><strong>Lokasi:</strong> ${lat ?? "Tidak tersedia"}, ${
        lon ?? "Tidak tersedia"
      }</p>
      `;

      document.getElementById("backButton").addEventListener("click", () => {
        window.history.back();
      });

      if (lat && lon) {
        const map = L.map(mapContainer).setView([lat, lon], 13);

        const openStreetMap = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          { attribution: "&copy; OpenStreetMap contributors" }
        );

        const cartoDB = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
          { attribution: "&copy; CartoDB" }
        );

        const stamenTerrain = L.tileLayer(
          "https://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.jpg",
          { attribution: "&copy; Stamen Design" }
        );

        openStreetMap.addTo(map);

        L.control
          .layers({
            OpenStreetMap: openStreetMap,
            "CartoDB Positron": cartoDB,
            "Stamen Terrain": stamenTerrain,
          })
          .addTo(map);

        const marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(`<b>${name}</b><br>${description}`).openPopup();
      }
    } catch (error) {
      storyDetailContainer.innerHTML = `<p class="error-message">Gagal memuat cerita: ${error.message}</p>`;
    }
  }
}
