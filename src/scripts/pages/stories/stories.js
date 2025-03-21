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
        <div id="map" class="stories-map"></div>
      </section>
    `;
  }

  async afterRender() {
    const storiesList = document.getElementById("storiesList");
    const addStoryButton = document.getElementById("addStoryButton");

    if (!storiesList) {
      console.error("Elemen storiesList tidak ditemukan!");
      return;
    }

    if (addStoryButton) {
      addStoryButton.removeEventListener("click", this.handleAddStoryClick);
      addStoryButton.addEventListener("click", this.handleAddStoryClick);
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn(
          "Token tidak ditemukan! Pengguna akan diarahkan ke login..."
        );
        setTimeout(() => {
          window.location.hash = "#/login";
        }, 3000);
        return;
      }

      const response = await getAllStories(token);
      storiesList.innerHTML = "";

      if (!response?.listStory || response.listStory.length === 0) {
        storiesList.innerHTML = "<p>Tidak ada cerita ditemukan.</p>";
        return;
      }

      if (this.map) {
        this.map.remove();
      }

      setTimeout(() => {
        this.map = L.map("map").setView([-2.5489, 118.0149], 5);

        const tileLayers = {
          OpenStreetMap: L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            { attribution: "&copy; OpenStreetMap contributors" }
          ),
          "CartoDB Positron": L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            { attribution: "&copy; CartoDB" }
          ),
          "Stamen Terrain": L.tileLayer(
            "https://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.jpg",
            { attribution: "&copy; Stamen Design" }
          ),
        };

        tileLayers.OpenStreetMap.addTo(this.map);
        L.control.layers(tileLayers).addTo(this.map);

        response.listStory.forEach((story) => {
          const storyElement = document.createElement("div");
          storyElement.innerHTML = `
            <img src="${story.photoUrl}" alt="${story.name}" width="200" />
            <h2>${story.name}</h2>
            <p>${story.description}</p>
            <p><small>Dibuat pada: ${new Date(
              story.createdAt
            ).toLocaleString()}</small></p>
            <button class="story-detail-button" data-id="${
              story.id
            }">Lihat Detail</button>
          `;

          storiesList.appendChild(storyElement);

          if (story.lat && story.lon) {
            const marker = L.marker([story.lat, story.lon]).addTo(this.map);
            marker.bindPopup(`<b>${story.name}</b><br>${story.description}`);
          }
        });

        document.querySelectorAll(".story-detail-button").forEach((button) => {
          button.removeEventListener("click", this.handleStoryDetailClick);
          button.addEventListener("click", this.handleStoryDetailClick);
        });
      }, 100);
    } catch (error) {
      storiesList.innerHTML = `<p style="color: red;">Gagal memuat cerita: ${error.message}</p>`;
    }
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
