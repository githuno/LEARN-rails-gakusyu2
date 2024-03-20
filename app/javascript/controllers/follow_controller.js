import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const isFollowed = entry.target.dataset.isFollowed === "true";
          this.setFollowButtonState(entry.target, isFollowed);
        }
      });
    });

    const followButtons = document.querySelectorAll("button.toggleFollow");
    followButtons.forEach((button) => {
      observer.observe(button);
    });

    console.log("Connected to FollowController");
  }

  toggleFollow(event) {
    const userId = event.target.dataset.userId;
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      .getAttribute("content");
    fetch(`/users/${userId}/toggle_follow`, {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-Token": csrfToken,
      },
      credentials: "same-origin",
    })
      .then((response) => response.json())
      .then((data) => {
        const isFollowed = data.status === "followed";
        this.updateFollowButtons(userId, isFollowed);
      });
  }

  updateFollowButtons(userId, isFollowed) {
    const followButtons = document.querySelectorAll(
      `button.toggleFollow[data-user-id="${userId}"]`
    );
    followButtons.forEach((button) => {
      this.setFollowButtonState(button, isFollowed);
    });
  }

  setFollowButtonState(button, isFollowed) {
    button.dataset.isFollowed = isFollowed.toString();
    button.textContent = isFollowed ? "フォロー解除" : "フォロー";
    if (isFollowed) {
      button.classList.remove("btn-outline-primary");
      button.classList.add("btn-outline-danger");
    } else {
      button.classList.remove("btn-outline-danger");
      button.classList.add("btn-outline-primary");
    }
  }
}
