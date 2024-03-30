import { Controller } from "@hotwired/stimulus";

class LikeController extends Controller {
  toggleLike() {
    const postId = this.element.dataset.postId;

    fetch(`/posts/${postId}/toggle_like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector("meta[name='csrf-token']")
          .content,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.updateLikeState(data.status === "liked");
        this.updateLikesCount(postId, data.count);
      });
  }

  updateLikeState(isLiked) {
    const icon = this.element.querySelector(`heart`);
    if (isLiked) {
      icon.classList.remove(`bi-heart`);
      icon.classList.add(`bi-heart-fill`);
    } else {
      icon.classList.remove(`bi-heart-fill`);
      icon.classList.add(`bi-heart`);
    }
  }

  updateLikesCount(postId, count) {
    const likesCountElement = document.querySelector(`#likes-count-${postId}`);
    if (likesCountElement) {
      likesCountElement.textContent = count;
    }
  }


}

export default LikeController;
