import L from "leaflet";
import { getAllStories } from "../../data/api";
import {
  addData,
  getData,
  deleteData,
  STORE_NAMES,
} from "../../utils/indexeddb";

export default class StoriesPage {
  constructor() {
    this.isShowingSavedStories = false;
    this.map = null; // Menambahkan properti map
  }

  async render() {
    return `
      <section class="container container-story" role="main">
        <h1>Stories</h1>
        <div class="button-container">
          <button class="add-story-btn" id="addStoryButton">
            <i class="fa-solid fa-plus"></i> Add Story
          </button>
          <button class="saved-stories-btn" id="viewSavedStories">
            <i class="fa-solid fa-bookmark"></i> Lihat Story Tersimpan
          </button>
        </div>
        <div id="storiesList" class="stories-list" tabindex="-1" aria-live="polite">
          Memuat cerita...
        </div>
        <div id="map" class="stories-map"></div> <!-- Map di sini -->
      </section>
    `;
  }

  async afterRender() {
    this.storiesList = document.getElementById("storiesList");
    this.viewSavedStoriesButton = document.getElementById("viewSavedStories");

    document
      .getElementById("addStoryButton")
      .addEventListener("click", this.handleAddStoryClick);
    this.viewSavedStoriesButton.addEventListener("click", () =>
      this.toggleStoriesView()
    );

    // Memastikan peta ditambahkan setelah stories dimuat
    if (!this.map) {
      this.map = L.map("map").setView([-2.5489, 118.0149], 5); // Inisialisasi peta
      const tileLayers = {
        OpenStreetMap: L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "&copy; OpenStreetMap contributors",
          }
        ),
        "CartoDB Positron": L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
          {
            attribution: "&copy; CartoDB",
          }
        ),
        "Stamen Terrain": L.tileLayer(
          "https://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.jpg",
          {
            attribution: "&copy; Stamen Design",
          }
        ),
      };

      tileLayers.OpenStreetMap.addTo(this.map);
      L.control.layers(tileLayers).addTo(this.map);
    }

    this.loadAllStories();
  }

  async loadAllStories() {
    this.isShowingSavedStories = false;
    this.viewSavedStoriesButton.innerHTML = `<i class="fa-solid fa-bookmark"></i> Lihat Story Tersimpan`;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.hash = "#/login";
        return;
      }

      const response = await getAllStories(token);
      const stories = response.listStory;
      this.renderStories(stories);
    } catch (error) {
      this.storiesList.innerHTML = `<p style="color: red;">Gagal memuat cerita: ${error.message}</p>`;
    }
  }

  async loadSavedStories() {
    this.isShowingSavedStories = true;
    this.viewSavedStoriesButton.innerHTML = `<i class="fa-solid fa-book"></i> Lihat Semua Story`;

    const savedStories = await getData(STORE_NAMES.SAVED_STORIES);
    this.renderStories(savedStories, true);
  }

  toggleStoriesView() {
    if (this.isShowingSavedStories) {
      this.loadAllStories();
    } else {
      this.loadSavedStories();
    }
  }

  renderStories(stories, isSavedStories = false) {
    this.storiesList.innerHTML = "";

    if (stories.length === 0) {
      this.storiesList.innerHTML = "<p>Tidak ada story yang tersedia.</p>";
      return;
    }

    stories.forEach((story) => {
      const storyElement = document.createElement("div");
      storyElement.classList.add("story-item");
      storyElement.innerHTML = `
        <img src="${story.photoUrl}" alt="${story.name}" width="200" />
        <h2>${story.name}</h2>
        <p>${story.description}</p>
        <p><small>Dibuat pada: ${new Date(
          story.createdAt
        ).toLocaleString()}</small></p>
        <button class="story-detail-button" data-id="${story.id}">
          <i class="fa-solid fa-eye"></i> Lihat Detail
        </button>
        <button class="${
          isSavedStories ? "remove-story-button" : "save-story-button"
        }" 
                data-story='${JSON.stringify(story)}'>
          <i class="fa-solid ${
            isSavedStories ? "fa-trash" : "fa-bookmark"
          }"></i> ${isSavedStories ? "Hapus dari Simpan" : "Simpan Story"}
        </button>
      `;
      this.storiesList.appendChild(storyElement);

      // Tambahkan marker jika cerita memiliki koordinat
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map);
        marker.bindPopup(`<b>${story.name}</b><br>${story.description}`);
      }
    });

    document.querySelectorAll(".story-detail-button").forEach((button) => {
      button.addEventListener("click", this.handleStoryDetailClick);
    });

    document.querySelectorAll(".save-story-button").forEach((button) => {
      button.addEventListener("click", this.handleSaveStoryClick.bind(this));
    });

    document.querySelectorAll(".remove-story-button").forEach((button) => {
      button.addEventListener(
        "click",
        this.handleRemoveSavedStoryClick.bind(this)
      );
    });
  }

  handleAddStoryClick(event) {
    event.stopPropagation();
    window.location.hash = "#/stories-add";
  }

  handleStoryDetailClick(event) {
    const storyId = event.currentTarget.getAttribute("data-id");
    if (storyId) {
      window.location.hash = `#/stories/${storyId}`;
    }
  }

  async handleSaveStoryClick(event) {
    const story = JSON.parse(event.currentTarget.getAttribute("data-story"));
    await addData(STORE_NAMES.SAVED_STORIES, story);
    alert("Story berhasil disimpan!");
    this.loadAllStories();
  }

  async handleRemoveSavedStoryClick(event) {
    const story = JSON.parse(event.currentTarget.getAttribute("data-story"));
    await deleteData(STORE_NAMES.SAVED_STORIES, story.id);
    alert("Story telah dihapus dari simpanan!");
    this.loadSavedStories();
  }
}
