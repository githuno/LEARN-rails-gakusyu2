import { Controller } from "@hotwired/stimulus";
import FollowController from "./follow_controller";

export default class extends Controller {
  edit(event) {
    console.log("edit");
    const modalType = event.target.dataset.modalType;

    if (modalType === "post") {
      this.editPost(event);
    } else if (modalType === "user") {
      this.showUser(event);
    }
  }
  editPost(event) {
    console.log("editPost");
    const postId = event.target.dataset.postId;
    const postContent = event.target.dataset.postContent;
    const postUpdatedAt = event.target.dataset.postUpdatedAt;

    const form = document.querySelector("#editModal form");
    const textArea = form.querySelector("textarea");
    const updatedAtField = document.querySelector("#editModal .updated-at");
    const deleteLink = document.querySelector("#editModal .btn-danger");

    form.action = "/posts/" + postId; // 編集のURLに変更
    form.method = "patch"; // フォームのメソッドをPATCHに変更
    textArea.value = postContent; // テキストエリアの内容を投稿の内容に変更
    updatedAtField.textContent = "最終更新日時: " + postUpdatedAt; // 最終更新日時を設定
    deleteLink.href = "/posts/" + postId; // 削除リンクのhref属性を設定
  }

  showUser(event) {
    console.log("showUser");
    const userId = event.target.dataset.userId;

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
        const followButton = document.querySelector("#userModal .toggleFollow");

        userNameField.textContent = user.username; // ヘッダータイトルにユーザー名をセット
        userProfileField.textContent = user.profile; // プロフィール内容をセット
        userBlogUrlLink.href = user.blog_url; // ブログURLのリンクを設定
        userBlogUrlLink.textContent = user.blog_url;

        // あとで修正：自分のユーザー情報の場合はフォローボタンをマイページへのリンクに変更

        // 既存のクリックイベントを削除
        followButton.removeEventListener("click", this.toggleFollow.bind(this));

        // フォローボタンの更新
        followButton.dataset.userId = user.id;
        followButton.dataset.isFollowed = user.is_followed;
      });
  }

  toggleFollow(event) {
    const followController = new FollowController();
    followController.toggleFollow(event);
  }
}
