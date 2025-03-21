import { subscribeNotification, unsubscribeNotification } from "../../data/api";

export default class NotificationPage {
  async render() {
    return `
      <section class="container notification-container">
        <h1 class="notification-title">Notification Page</h1>
        <div class="notification-buttons-container">
          <button class="notification-button subscribe-button" id="subscribeButton">
            <i class="fas fa-bell"></i> Subscribe
          </button>
          <button class="notification-button unsubscribe-button" id="unsubscribeButton">
            <i class="fas fa-bell-slash"></i> Unsubscribe
          </button>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "#/login";
      return;
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Gagal mendaftar Service Worker", error);
      });
    }

    const subscribeButton = document.getElementById("subscribeButton");
    const unsubscribeButton = document.getElementById("unsubscribeButton");

    subscribeButton.addEventListener("click", async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription =
          await registration.pushManager.getSubscription();

        if (existingSubscription) {
          alert("Anda sudah berlangganan notifikasi!");
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk",
        });

        const subscriptionJSON = subscription.toJSON();
        if (!subscriptionJSON.keys.p256dh) {
          throw new Error("Missing keys.p256dh");
        }

        const response = await subscribeNotification(token, subscriptionJSON);

        alert(response.message);
      } catch (error) {
        console.error("Gagal Subscribe Notifikasi:", error);
        alert("Gagal Subscribe Notifikasi. Coba lagi.");
      }
    });

    unsubscribeButton.addEventListener("click", async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          alert("Anda belum berlangganan notifikasi!");
          return;
        }

        await subscription.unsubscribe();

        const response = await unsubscribeNotification(token, {
          endpoint: subscription.endpoint,
        });

        alert(response.message);
      } catch (error) {
        console.error("Gagal Unsubscribe Notifikasi:", error);
        alert("Gagal Unsubscribe Notifikasi. Coba lagi.");
      }
    });
    async function checkSubscriptionStatus() {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        document.getElementById("subscribeButton").disabled = true;
        document.getElementById("unsubscribeButton").disabled = false;
      } else {
        document.getElementById("subscribeButton").disabled = false;
        document.getElementById("unsubscribeButton").disabled = true;
      }
    }

    document.addEventListener("DOMContentLoaded", checkSubscriptionStatus);
  }
}
