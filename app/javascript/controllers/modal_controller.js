import { Controller } from "@hotwired/stimulus";
import FollowController from "./follow_controller";

class ModalController extends Controller {
  // 投稿編集 -------------------------------------------------------------------
  editPost(event) {
    console.log("editPost");
    const postId = event.target.dataset.postId;
    const postContent = event.target.dataset.postContent;
    const postUpdatedAt = event.target.dataset.postUpdatedAt;

    const form = document.querySelector("#editModal form");
    const textArea = form.querySelector("textarea");
    const updatedAtField = document.querySelector("#editModal .updated-at");
    const deleteLink = document.querySelector("#editModal .btn-danger");

    form.setAttribute("action", "/posts/" + postId); // フォームのアクションを編集のURLに変更
    form.setAttribute("method", "patch"); // フォームのメソッドをPATCHに変更
    textArea.value = postContent; // テキストエリアの内容を投稿の内容に変更
    updatedAtField.textContent = "最終更新日時: " + postUpdatedAt; // 最終更新日時を設定
    deleteLink.href = "/posts/" + postId; // 削除リンクのhref属性を設定
  }
  // ユーザー情報 ---------------------------------------------------------------
  showUser(event) {
    const userId = event.target.dataset.userId;
    const myId = event.target.dataset.myId;
    // ユーザー情報を取得
    fetch(`/users/${userId}/show_json`)
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
          if (userId === myId) {
            // followbuttonをmypageに変更しマイページにリンク
            const mypage = document.createElement("div");
            mypage.className = "mypage";
            mypage.innerHTML = `<a href="/users/${userId}">マイページ</a>`;
            followButton.replaceWith(mypage);
          } else {
            followButton.dataset.userId = user.id;
            followButton.dataset.isFollowed = user.is_followed;
          }

          // followControllerをconnectする
          const followController = new FollowController();
          followController.connect();
        }
      });

    const userModalElement = document.getElementById("userModal");
    forLikersModal(userModalElement);
    userModalElement.dataset.postId = event.target.dataset.postId;
  }
  // Likers一覧 ----------------------------------------------------------------
  showLikers(event) {
    const postId = event.currentTarget.dataset.postId;
    const myId = event.target.dataset.myId;

    // いいねしたユーザーの一覧を取得
    fetch(`/posts/${postId}/likers`)
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
          a.dataset.userId = user.id;
          a.dataset.postId = postId;
          a.dataset.myId = myId;
          a.dataset.action = "click->modal#showUser";
          a.style.textDecoration = "underline"; // 下線を追加
          li.appendChild(a);
          usersList.appendChild(li);
        });
      });
  }
}

// likersモーダル→ userモーダル→ likersモーダル
const forLikersModal = (userModalElement) => {
  userModalElement.addEventListener("hidden.bs.modal", function (event) {
    const postId = event.target.dataset.postId;
    if (postId !== "none") {
      const likersModal = new bootstrap.Modal(
        document.getElementById("likersModal")
      );
      userModalElement.dataset.postId = "none"; // userModalのpostidをnoneに変更
      // mypageボタン(.btn.toggleFollow)にreplace
      const mypage = document.querySelector(".mypage");
      if (mypage) {
        const button = document.createElement("button");
        button.className = "btn toggleFollow";
        mypage.replaceWith(button);
      }
      likersModal.show();
    }
  });
};

export default ModalController;
