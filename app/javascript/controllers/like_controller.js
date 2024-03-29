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

  showLikers(event) {
    const postId = event.currentTarget.dataset.postId;

    // いいねしたユーザーの一覧を取得
    fetch(`/posts/${postId}/likers`)
      .then(response => response.json())
      .then(users => {
        const usersList = document.getElementById('likersList');
        usersList.innerHTML = '';

        // ユーザーの一覧をモーダルに表示
        users.forEach(user => {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.textContent = user.username;
          a.dataset.bsToggle = 'modal';
          a.dataset.controller = 'modal';
          a.dataset.modalType = 'user';
          a.dataset.bsTarget = '#userModal';
          a.dataset.userId = user.id;
          a.dataset.postId = postId;
          a.dataset.action = 'click->modal#showUser';
          a.style.textDecoration = 'underline'; // 下線を追加
          li.appendChild(a);
          usersList.appendChild(li);
        });
      });
  }
}

export default LikeController;
