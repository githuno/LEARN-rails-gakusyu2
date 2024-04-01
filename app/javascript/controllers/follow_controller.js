import { Controller } from "@hotwired/stimulus";

class FollowController extends Controller {
  connect() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.dataset.post) {
          const isFollowed = JSON.parse(entry.target.dataset.post).is_followed;
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
    const post = JSON.parse(event.target.dataset.post)
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      .getAttribute("content");
    fetch(`/users/${post.user_id}/toggle_follow`, {
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
        const button = event.target;
        this.setFollowButtonState(button, isFollowed);
      });
  }

  setFollowButtonState(button, isFollowed) {
    JSON.parse(button.dataset.post).is_followed = isFollowed;
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

export default FollowController;
