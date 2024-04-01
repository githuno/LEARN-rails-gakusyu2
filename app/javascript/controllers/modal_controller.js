import { Controller } from "@hotwired/stimulus";
import FollowController from "./follow_controller";

class ModalController extends Controller {
  // 投稿内容をモーダルに表示 -----------------------------------------------------
  fillPostContent(post, targetElement) {
    const contentElement = targetElement.querySelector("#postContent");
    const dateElement = targetElement.querySelector("#postUpdatedAt");
    contentElement.textContent = post.content;
    dateElement.textContent = post.updated_at;
  }
  // 投稿編集モーダル -----------------------------------------------------------
  editPost(event) {
    console.log("editPost");
    const post = JSON.parse(event.target.dataset.post);

    const form = document.querySelector("#editModal form");
    const textArea = form.querySelector("textarea");
    const updatedAtField = document.querySelector("#editModal .updated-at");
    const deleteLink = document.querySelector("#editModal .btn-danger");

    form.setAttribute("action", "/posts/" + post.id); // フォームのアクションを編集のURLに変更
    form.setAttribute("method", "patch"); // フォームのメソッドをPATCHに変更
    textArea.value = post.content; // テキストエリアの内容を投稿の内容に変更
    updatedAtField.textContent = "最終更新日時: " + post.updated_at; // 最終更新日時を設定
    deleteLink.href = "/posts/" + post.id; // 削除リンクのhref属性を設定
  }
  // ユーザー情報モーダル --------------------------------------------------------
  showUser(event) {
    let pageRoot = event.target.dataset.root;
    const post = JSON.parse(event.target.dataset.post);
    const myId = event.target.dataset.myId;
    const modalElement = document.getElementById("userModal");
    this.fillPostContent(post, modalElement);

    fetch(`/users/${post.user_id}/show_json`)
      .then((response) => response.json())
      .then((user) => {
        const userNameField = document.querySelector("#userModal .user-name");
        const userProfileField = document.querySelector(
          "#userModal .profile-content"
        );
        const userBlogUrlLink = document.querySelector(
          "#userModal .user-blog-url-link"
        );
        userNameField.textContent = user.username; // ヘッダータイトルにユーザー名をセット
        userProfileField.textContent = user.profile; // プロフィール内容をセット
        if (userBlogUrlLink) {
          userBlogUrlLink.href = user.blog_url; // ブログURLのリンクを設定
          userBlogUrlLink.textContent = user.blog_url; // ブログURLのリンクを設定
        }

        const followButton = document.querySelector("#userModal .toggleFollow");
        // 自分のユーザー情報の場合はフォローボタンをマイページへのリンクに変更
        if (followButton) {
          if (post.user_id === myId) {
            const mypage = document.createElement("div");
            mypage.className = "mypage";
            mypage.innerHTML = `<a href="/users/${post.user_id}">マイページ</a>`;
            followButton.replaceWith(mypage);
          } else {
            followButton.dataset.post = JSON.stringify(post);
          }

          // followControllerをconnectする
          const followController = new FollowController();
          followController.connect();
        }
      });
    
    const userModal = bootstrap.Modal.getInstance(modalElement);
    if(pageRoot === "likers") { // pageRootがlikers一覧の場合は再度likersModalを表示する
      userModal._element.addEventListener(
        "hidden.bs.modal",
        this.reopenLikersModal
      );
    } else {
      userModal._element.removeEventListener(
        "hidden.bs.modal",
        this.reopenLikersModal
      );
    }
  }
  // Likers一覧モーダル ---------------------------------------------------------
  showLikers(event) {
    const post = JSON.parse(event.target.dataset.post);
    const myId = event.target.dataset.myId;
    const modalElement = document.getElementById("likersModal");
    this.fillPostContent(post, modalElement);

    // いいねしたユーザーの一覧を取得
    fetch(`/posts/${post.id}/likers`)
      .then((response) => response.json())
      .then((users) => {
        const usersList = document.getElementById("likersList");
        usersList.innerHTML = "";

        // ユーザーの一覧をモーダルに表示
        users.forEach((user) => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.textContent = user.username;
          a.dataset.bsToggle = "modal";
          a.dataset.controller = "modal";
          a.dataset.modalType = "user";
          a.dataset.bsTarget = "#userModal";
          a.dataset.post = JSON.stringify(post);
          a.dataset.root = "likers";
          a.dataset.myId = myId;
          a.dataset.action = "click->modal#showUser";
          a.style.textDecoration = "underline"; // 下線を追加
          li.appendChild(a);
          usersList.appendChild(li);
        });
      });
  }

  reopenLikersModal(event) {
    const likersModalElement = document.getElementById("likersModal");
    const likersModal = bootstrap.Modal.getInstance(likersModalElement);

    // mypageボタンを(.btn.toggleFollow)にreplace
    const mypage = document.querySelector(".mypage");
    if (mypage) {
      const button = document.createElement("button");
      button.className = "btn toggleFollow";
      mypage.replaceWith(button);
    }

    // 再度モーダルを表示
    likersModal.show();
  }
}

export default ModalController;
