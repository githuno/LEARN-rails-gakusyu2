import { Controller } from "@hotwired/stimulus";

class CommentController extends Controller {
  addComment(event) {
    event.preventDefault();
    const post = JSON.parse(event.target.dataset.post);
    const formElement = event.target.closest("form");
    const textareaElement = formElement.querySelector("textarea");
    if (!textareaElement) {
      console.error("textarea element is not found");
      return;
    }
    const content = textareaElement.value;
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      .getAttribute("content");
    fetch(`/posts/${post.id}/comments`, {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ comment: { content: content } }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }
        return response.json();
      })
      .then((comment) => {
        const commentsList = document.getElementById("commentsList");
        const li = document.createElement("li");
        li.textContent = comment.content;
        commentsList.prepend(li);
      });

    textareaElement.value = "";
  }
}

export default CommentController;
