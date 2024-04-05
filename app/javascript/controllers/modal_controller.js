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
  // 新規投稿モーダル -----------------------------------------------------------
  newPost(event) {
    // 画像アップローダーの初期化
    const uploadAreas = document.querySelectorAll(".upload-area");
    const fileInputs = document.querySelectorAll(".file-input");
    const textInput = document.querySelector("#textInput"); // テキスト入力フィールドを取得
    const submitButton = document.querySelector("#submitButton"); // submitボタンを取得
    const errorElement = document.querySelector("#errorElement"); // エラーメッセージを表示する要素を取得

    uploadAreas.forEach((uploadArea, index) => {
      const fileInput = fileInputs[index];

      if (uploadArea && fileInput) {
        console.log("uploadArea and fileInput found");
        uploadArea.addEventListener("click", () => {
          fileInput.click();
        });

        ["dragover", "dragleave", "drop"].forEach((eventName) => {
          uploadArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
          });
        });

        uploadArea.addEventListener("drop", (e) => {
          const files = e.dataTransfer.files;
          fileInput.files = files;
        });

        fileInput.addEventListener("change", () => {
          // ファイルが選択されたらuploadAreaにサムネイルを表示
          const reader = new FileReader();
          reader.onload = (e) => {
            uploadArea.style.backgroundImage = `url(${e.target.result})`;
            uploadArea.style.backgroundSize = "cover"; // 追加
            uploadArea.style.backgroundPosition = "center"; // 追加
          };
          // 画像サイズが5MBを超えていたらエラーメッセージを表示
          if (fileInput.files[0].size > 5 * 1024 * 1024) {
            errorElement.textContent =
              "画像サイズが大きすぎます。5MB以下の画像を選択してください。";
            fileInput.value = ""; // ファイル選択をクリア
            submitButton.disabled = true; // submitボタンを無効化
            return;
          } else {
            errorElement.textContent = ""; // エラーメッセージをクリア
            submitButton.disabled = false; // submitボタンを有効化
          }
          reader.readAsDataURL(fileInput.files[0]);

          // ファイルが選択されたら次のアップロードエリアを表示
          if (index < 3) {
            const nextUploadArea = document.getElementById(
              `upload-area-${index + 1}`
            );
            nextUploadArea.classList.remove("d-none");
          }
        });
      } else {
        console.error("uploadArea or fileInput not found");
      }
    });

    const validateTextInput = () => {
      if (textInput.value.length < 1 || textInput.value.length > 140) {
        errorElement.textContent =
          "テキストは1文字以上140字以下で入力してください。";
        submitButton.disabled = true; // submitボタンを無効化
      } else {
        errorElement.textContent = ""; // エラーメッセージをクリア
        submitButton.disabled = false; // submitボタンを有効化
      }
    };

    textInput.addEventListener("input", validateTextInput);
    validateTextInput(); // ページ読み込み時にもバリデーションチェックを行う
  }
  // 投稿編集モーダル -----------------------------------------------------------
  editPost(event) {
    console.log("editPost");
    const post = JSON.parse(event.target.dataset.post);
    const form = document.querySelector("#editModal form");
    const textArea = form.querySelector("textarea");
    const updatedAtField = document.querySelector("#editModal .updated-at");
    const deleteLink = document.querySelector("#editModal .btn-danger");
    const carouselInner = document.querySelector(
      "#carouselExampleIndicators .carousel-inner"
    ); // カルーセルの内部要素を取得

    form.setAttribute("action", "/posts/" + post.id); // フォームのアクションを編集のURLに変更
    form.setAttribute("method", "patch"); // フォームのメソッドをPATCHに変更
    textArea.value = post.content; // テキストエリアの内容を投稿の内容に変更
    updatedAtField.textContent = "最終更新日時: " + post.updated_at; // 最終更新日時を設定
    deleteLink.href = "/posts/" + post.id; // 削除リンクのhref属性を設定

    // カルーセルのスライドとインジケータをクリア
    const carouselIndicators = document.querySelector(
      "#carouselExampleIndicators .carousel-indicators"
    );
    while (carouselInner.firstChild) {
      carouselInner.removeChild(carouselInner.firstChild);
      carouselIndicators.removeChild(carouselIndicators.firstChild);
    }

    // フェッチした画像データをカルーセルにセット
    post.images.forEach((imageKey, index) => {
      // CloudinaryのURLを作成
      const cloudinaryName = event.target.dataset.cloud;
      const imageUrl = `https://res.cloudinary.com/${cloudinaryName}/image/upload/${imageKey}`;

      // 画像をフェッチ
      fetch(imageUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);

          // カルーセルアイテムを作成
          const carouselItem = document.createElement("div");
          carouselItem.classList.add("carousel-item");
          if (index === 0) {
            carouselItem.classList.add("active");
          }

          // // 削除ボタンを作成
          // const deleteButton = document.createElement("button");
          // deleteButton.type = "button";
          // deleteButton.classList.add("btn", "btn-danger", "delete-image");
          // deleteButton.textContent = "☓";
          // deleteButton.dataset.imageKey = imageKey;
          // carouselItem.appendChild(deleteButton);


          const img = document.createElement("img");
          img.src = url;
          img.classList.add("d-block", "w-100");

          carouselItem.appendChild(img);
          carouselInner.appendChild(carouselItem);

          // カルーセルインジケータを作成
          const indicator = document.createElement("button");
          indicator.type = "button";
          indicator.dataset.bsTarget = "#carouselExampleIndicators";
          indicator.dataset.bsSlideTo = index;
          if (index === 0) {
            indicator.classList.add("active");
          }

          carouselIndicators.appendChild(indicator);
        });
    });
  }
  // コメントモーダル -----------------------------------------------------------
  showComments(event) {
    const post = JSON.parse(event.target.dataset.post);
    const modalElement = document.getElementById("commentModal");
    this.fillPostContent(post, modalElement);

    // コメント一覧を取得
    fetch(`/posts/${post.id}/comments`)
      .then((response) => response.json())
      .then((comments) => {
        const commentsList = modalElement.querySelector("#commentsList");
        commentsList.innerHTML = "";
        comments.forEach((comment) => {
          const li = document.createElement("li");
          li.textContent = comment.content;
          commentsList.appendChild(li);
        });
      });

    // ボタンに投稿情報をセット
    const submitButton = modalElement.querySelector(
      "#commentModal .addComment"
    );
    if (submitButton) {
      submitButton.dataset.post = JSON.stringify(post);
    }
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
        const userNameField = document.querySelector("#userModal .name");
        const userProfileField = document.querySelector(
          "#userModal .profile-content"
        );
        const userBlogUrlLink = document.querySelector("#userModal .blog-link");
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
            // ボタンに投稿情報をセット
            followButton.dataset.post = JSON.stringify(post);
          }

          // followControllerをconnectする
          const followController = new FollowController();
          followController.connect();
        }
      });

    const userModal = bootstrap.Modal.getInstance(modalElement);
    if (pageRoot === "likers") {
      // pageRootがlikersの場合はモーダルを閉じたとき再度likersModalを表示する
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
