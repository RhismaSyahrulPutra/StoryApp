import CONFIG from "../config";
import { addData, getData, deleteData, STORE_NAMES } from "../utils/indexeddb";

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORIES_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

export async function registerUser(name, email, password) {
  return fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  }).then(handleResponse);
}

export async function loginUser(email, password) {
  return fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);
}

export async function getAllStories(token, page = 1, size = 10, location = 0) {
  if (!token) throw new Error("Token is missing. Please log in again.");

  try {
    const response = await fetch(
      `${ENDPOINTS.STORIES}?page=${page}&size=${size}&location=${location}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await handleResponse(response);
    await addData(STORE_NAMES.API_CACHE, { id: "stories", data });
    return data;
  } catch (error) {
    console.error("Fetching stories failed, retrieving from cache", error);
    const cachedData = await getData(STORE_NAMES.API_CACHE, "stories");
    return cachedData ? cachedData.data : [];
  }
}

export async function getStoryDetail(id, token) {
  if (!token) throw new Error("Token is missing. Please log in again.");

  try {
    const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await handleResponse(response);
    await addData(STORE_NAMES.API_CACHE, { id: `story_${id}`, data });
    return data;
  } catch (error) {
    console.error("Fetching story detail failed, retrieving from cache", error);
    const cachedData = await getData(STORE_NAMES.API_CACHE, `story_${id}`);
    return cachedData ? cachedData.data : null;
  }
}

export async function addNewStory(token, description, photo, lat, lon) {
  if (!token) throw new Error("Token is missing. Please log in again.");

  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);
  if (lat) formData.append("lat", lat);
  if (lon) formData.append("lon", lon);

  return fetch(ENDPOINTS.STORIES, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }).then(handleResponse);
}

export async function addNewStoryGuest(description, photo, lat, lon) {
  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);
  if (lat) formData.append("lat", lat);
  if (lon) formData.append("lon", lon);

  return fetch(ENDPOINTS.STORIES_GUEST, {
    method: "POST",
    body: formData,
  }).then(handleResponse);
}

export async function subscribeNotification(token, subscription) {
  if (!token) throw new Error("Token is missing. Please log in again.");

  if (
    !subscription.keys ||
    !subscription.keys.p256dh ||
    !subscription.keys.auth
  ) {
    throw new Error("keys.p256dh and keys.auth are required");
  }

  return fetch(ENDPOINTS.SUBSCRIBE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    }),
  }).then(handleResponse);
}

export async function unsubscribeNotification(token, { endpoint }) {
  if (!token) throw new Error("Token is missing. Please log in again.");

  return fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint }),
  }).then(handleResponse);
}

async function handleResponse(response) {
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Something went wrong");
    } else {
      throw new Error("Unexpected error occurred.");
    }
  }

  const contentType = response.headers.get("content-type");
  return contentType && contentType.includes("application/json")
    ? response.json()
    : { status: response.status, message: "Success" };
}

export default ENDPOINTS;
