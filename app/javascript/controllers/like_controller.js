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
        // debug:statusを出力　
        console.log(data.status);
      });
  }
}

export default LikeController;
