import { Controller } from "@hotwired/stimulus";

class CommentController extends Controller {
  connect() {
    console.log("Connected to CommentController");
    if (!this.element.dataset.post) {
      return;
    }
    const count = parseInt(
      this.element.querySelector("#comments_cnt").textContent
    );
    this.updateCommentIcon(this.element, count);
  }

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

        // コメント数を更新
        const targetElemnt = document.querySelector(`#comment-icon-${post.id}`);
        const countElement = targetElemnt.querySelector("#comments_cnt");
        const count = parseInt(countElement.textContent) + 1;
        countElement.textContent = count;
        this.updateCommentIcon(targetElemnt, count);
      });

    textareaElement.value = "";
  }

  // コメントの数に応じてコメントボタンの表示を切り替える
  updateCommentIcon(target, count) {
    const imgElement = target.querySelector("img");
    if (count === 0) {
      imgElement.src = target.dataset.chat0;
    } else if (count === 1) {
      imgElement.src = target.dataset.chat1;
    } else if (count < 5) {
      imgElement.src = target.dataset.chat2;
    } else if (count < 10) {
      imgElement.src = target.dataset.chat3;
    } else if (count < 20) {
      imgElement.src = target.dataset.chat4;
    } else if (count < 30) {
      imgElement.src = target.dataset.chat5;
    } else if (count < 50) {
      imgElement.src = target.dataset.chat6;
    } else {
      imgElement.src = target.dataset.chatFill;
    }
  }
}

export default CommentController;
