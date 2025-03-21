// Start Pages
import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";

// Auth Pages
import LoginPage from "../pages/auth/login";
import RegisterPage from "../pages/auth/register";

// Stories Pages
import StoriesPage from "../pages/stories/stories";
import StoriesDetailPage from "../pages/stories/storyDetail";
import AddStoryPage from "../pages/stories/addStory,";

// Notifications Pages
import NotificationPage from "../pages/notifications/notifications";

import NotFoundPage from "../pages/notFound/notFoundPage";

const routes = {
  "/": new HomePage(),
  "/about": new AboutPage(),

  "/login": {
    render: () => {
      if (localStorage.getItem("token")) {
        window.location.replace("/");
      } else {
        return new LoginPage().render();
      }
    },
    afterRender: () => new LoginPage().afterRender(),
  },

  "/register": {
    render: () => {
      if (localStorage.getItem("token")) {
        window.location.replace("/");
      } else {
        return new RegisterPage().render();
      }
    },
    afterRender: () => new RegisterPage().afterRender(),
  },

  "/stories": new StoriesPage(),
  "/stories/:id": new StoriesDetailPage(),
  "/stories-add": new AddStoryPage(),
  "/notifications": new NotificationPage(),

  "*": new NotFoundPage(),
};

export default routes;
