import { Controller } from "@hotwired/stimulus";
import FollowController from "./follow_controller";

class ModalController extends Controller {
  // モーダル内の表示パーツ ------------------------------------------------------

  fillPostContent(post, targetModal) {
    const contentElement = targetModal.querySelector("#postContent");
    const dateElement = targetModal.querySelector("#postUpdatedAt");
    contentElement.textContent = post.content;
    dateElement.textContent = post.updated_at;
  }
  setImages = (imagekeys, targetModal, templateElement) => {
    const carouselInner = targetModal.querySelector(".carousel-inner");
    const carouselId = targetModal.querySelector(".carousel").id;
    if (imagekeys.length === 0) {
      carouselInner.remove();
      return;
    }
    const cloudinaryName = event.target.dataset.cloud;
    for (let i = 0; i < imagekeys.length; i++) {
      if (!carouselInner.children[i]) {
        // templateElementを複製してカルーセルアイテムを追加
        const newCarouselItem = templateElement.cloneNode(true);
        carouselInner.appendChild(newCarouselItem);
      }
      const imageUrl = `https://res.cloudinary.com/${cloudinaryName}/image/upload/${imagekeys[i]}`;
      const carouselItem = carouselInner.children[i];
      const uploadArea = carouselItem.querySelector(".upload-area");

      // 既存のカルーセルアイテムのuploadAreaの背景にセット
      uploadArea.style.backgroundImage = `url(${imageUrl})`;
      uploadArea.style.backgroundSize = "cover"; // 画像を枠内に収める
      uploadArea.style.backgroundPosition = "center"; // 画像を中央に配置

      // .upload-instructionsを削除
      const uploadInstructions = carouselItem.querySelector(
        ".upload-instructions"
      );
      if (uploadInstructions) {
        uploadInstructions.remove();
      }
    }
    const count = imagekeys.length ? imagekeys.length - 1 : 0;
    this.resetCarouselIndicators(count, targetModal, carouselId);
    this.resetCarouselButtons(count, targetModal);
  };
  carouselErrorCatcher(targetModal) {
    const carousel = new bootstrap.Carousel(
      targetModal.querySelector(".carousel")
    );
    const carouselItems = carousel._element.querySelectorAll(".carousel-item");

    // イベントリスナーの設定
    carousel._element.addEventListener("slide.bs.carousel", () => {
      try {
        const currentIndex = Array.from(carouselItems).indexOf(
          targetModal.querySelector(".carousel-item.active")
        );
        console.log(currentIndex);
      } catch (error) {
        this.resetCarouselIndicators(carouselItems.length, targetModal);
      }
    });

    // カルーセルの要素が変更された際にイベントリスナーを再設定
    targetModal.addEventListener("DOMNodeInserted", () => {
      this.carouselErrorCatcher(targetModal);
    });
  }
  // 投稿詳細モーダル -----------------------------------------------------------
  showPost(event) {
    const modalElement = document.getElementById("postModal");
    const carouselItem = modalElement.querySelector(".carousel-item");
    const carouselItemTemplate = carouselItem.cloneNode(true);
    const post = JSON.parse(event.target.dataset.post);

    this.fillPostContent(post, modalElement);
    this.setImages(post.image_keys, modalElement, carouselItemTemplate);
    this.carouselErrorCatcher(modalElement);
  }

  resetCarouselIndicators = (count, targetModal) => {
    const carouselId = targetModal.querySelector(".carousel").id;
    const carouselIndicators = targetModal.querySelector(
      ".carousel-indicators"
    );
    // 既存のインジケーターを全て削除
    while (carouselIndicators.firstChild) {
      carouselIndicators.removeChild(carouselIndicators.firstChild);
    }
    const newCount = count > 3 ? 3 : count; // インジケーターの最大数を4に制限
    // 新しいインジケーターを追加
    for (let i = 0; i <= newCount; i++) {
      const newIndicator = document.createElement("button");
      newIndicator.type = "button";
      newIndicator.dataset.bsTarget = carouselId;
      newIndicator.dataset.bsSlideTo = i;
      if (i === 0 && newIndicator) newIndicator.classList.add("active");
      carouselIndicators.appendChild(newIndicator);
    }
  };

  resetCarouselButtons = (count, targetModal) => {
    const nextButton = targetModal.querySelector("#nextButton"); // 次のボタンを取得
    const prevButton = targetModal.querySelector("#prevButton"); // 戻るボタンを取得
    if (!count) {
      nextButton.style.display = "none";
      prevButton.style.display = "none";
    } else {
      nextButton.style.display = "inline-block";
      prevButton.style.display = "inline-block";
    }
  };

  // 新規投稿モーダル -----------------------------------------------------------
  newPost(event) {
    let modalElement;
    if (event.target.dataset.post) {
      modalElement = document.getElementById("editModal");
    } else {
      modalElement = document.getElementById("newModal");
    }
    const textInput = modalElement.querySelector("#textInput"); // テキスト入力フィールドを取得
    const submitButton = modalElement.querySelector("#submitButton"); // submitボタンを取得
    const errorElement = modalElement.querySelector("#errorElement"); // エラーメッセージを表示する要素を取得

    // カルーセルアイテムのテンプレートを作成
    const carouselItemTemplate = modalElement
      .querySelector(".carousel-item")
      .cloneNode(true);

    const attachedFilesCnt = () => {
      const fileInputs = modalElement.querySelectorAll(".file-input");
      let attachedFilesCnt = 0;
      for (let i = 0; i < 4; i++) {
        if (fileInputs[i]) {
          // fileInputs[i]がundefinedでないことを確認
          attachedFilesCnt += fileInputs[i].files.length;
        }
      }
      return attachedFilesCnt;
    };

    const setValidThumbnail = (fileInput, uploadArea) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadArea.style.backgroundImage = `url(${e.target.result})`;
        uploadArea.style.backgroundSize = "cover"; // 追加
        uploadArea.style.backgroundPosition = "center"; // 追加
      };
      // ファイルが選択されているか、および画像サイズが5MBを超えていたらエラーメッセージを表示
      if (
        fileInput.files &&
        fileInput.files[0] &&
        fileInput.files[0].size > 5 * 1024 * 1024
      ) {
        errorElement.textContent =
          "画像サイズが大きすぎます。5MB以下の画像を選択してください。";
        fileInput.value = ""; // ファイル選択をクリア
        submitButton.disabled = true; // submitボタンを無効化
        return;
      } else {
        errorElement.textContent = ""; // エラーメッセージをクリア
        submitButton.disabled = false; // submitボタンを有効化
        validateTextInput(); // テキスト入力のバリデーションチェックを行う
      }
      if (fileInput.files && fileInput.files[0]) {
        reader.readAsDataURL(fileInput.files[0]);
      }
    };

    const addCarouselItem = () => {
      const fileCount = attachedFilesCnt();
      if (fileCount === 4) return;
      try {
        const carouselInner = modalElement.querySelector(".carousel-inner");
        const newCarouselItem = carouselItemTemplate.cloneNode(true);
        if (newCarouselItem.classList.contains("active"))
          newCarouselItem.classList.remove("active");
        const newUploadArea = newCarouselItem.querySelector(".upload-area");
        const newFileField = newCarouselItem.querySelector(".file-input");

        // 0~3の配列を作成
        const indices = [0, 1, 2, 3];
        // 既存のアイテムのインデックスを取得
        const existingIndices = Array.from(
          modalElement.querySelectorAll(".carousel-item")
        ).map((item) =>
          parseInt(item.querySelector(".file-input").dataset.index)
        );
        // 使用されていないインデックスを配列取得
        const unusedIndices = indices.filter(
          (index) => !existingIndices.includes(index)
        );
        // 使用されていないインデックスの最初の要素を取得
        const newIndex = unusedIndices[0];
        newUploadArea.id = `upload-area-${newIndex}`;
        newFileField.dataset.index = `${newIndex}`;
        carouselInner.appendChild(newCarouselItem);

        // 追加したアイテムにイベントリスナーを設定
        setupUploadArea(newCarouselItem);
      } catch (error) {
        console.log("on addCarouselItem: ", error);
        this.resetCarouselIndicators(fileCount, modalElement);
      }
    };

    const addDeleteIcon = (uploadArea) => {
      const deleteIcon = document.createElement("i");
      deleteIcon.classList.add("bi", "bi-trash");
      deleteIcon.style.position = "absolute";
      deleteIcon.style.top = "10px";
      deleteIcon.style.color = "red";
      deleteIcon.style.backgroundColor = "white";
      deleteIcon.style.borderRadius = "50%";
      deleteIcon.style.opacity = "0.5";
      deleteIcon.style.width = "30px"; // 幅を設定
      deleteIcon.style.height = "30px"; // 高さを設定
      deleteIcon.style.fontSize = "20px"; // フォントサイズを設定
      uploadArea.style.position = "relative";
      uploadArea.appendChild(deleteIcon);
      deleteIcon.addEventListener("click", (event) => {
        event.stopPropagation(); // イベントのバブリング（親要素へのイベント伝播）を停止
        deleteImage();
      });
    };

    const deleteImage = () => {
      const currentCarouselItem = modalElement.querySelector(
        ".carousel-item.active"
      );
      const uploadArea = currentCarouselItem.querySelector(".upload-area");
      uploadArea.style.backgroundImage = "";
      uploadArea.querySelector(".file-input").value = "";
      uploadArea.querySelector(".bi-trash")?.remove();

      const carouselItems = modalElement.querySelectorAll(".carousel-item");
      const emptyCarouselItems = Array.from(carouselItems).filter((item) => {
        const fileInput = item.querySelector(".file-input");
        // アクティブなアイテムは削除対象から除外
        return item !== currentCarouselItem && fileInput && !fileInput.value;
      });

      emptyCarouselItems.forEach((item) => {
        item.querySelector(".bi-trash")?.remove();
        item.remove();
      });

      const count = attachedFilesCnt();
      this.resetCarouselIndicators(count, modalElement);
      this.resetCarouselButtons(count, modalElement);
    };
    let clicked = false;
    let tempFile = null; // 一時的にファイルを保存するための変数

    const onUploadAreaClick = (event, fileInput) => {
      event.stopPropagation();
      if (!clicked) {
        // ファイルがセットされている場合、一時的に保存
        if (fileInput.files.length > 0) {
          tempFile = fileInput.files[0];
        }
        fileInput.click();
        clicked = true;

        // フォーカスが戻ったときにクリックフラグをリセット
        window.addEventListener("focus", () => (clicked = false), {
          once: true,
        });
      }
    };

    const setupUploadArea = (targetItem) => {
      const uploadArea = targetItem.querySelector(".upload-area");
      const fileInput = uploadArea.querySelector(".file-input");

      // アップロードエリアのクリックでファイルインプット
      if (uploadArea && fileInput) {
        uploadArea.removeEventListener("click", onUploadAreaClick); // 重複登録を防ぐ
        uploadArea.addEventListener("click", (event) =>
          onUploadAreaClick(event, fileInput)
        );
      }

      // ファイルインプットの変更で諸々
      fileInput.addEventListener("change", () => {
        // ファイルが空になった（キャンセルされた）場合、一時的に保存したファイルを再セット
        if (fileInput.files.length === 0 && tempFile) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(tempFile);
          fileInput.files = dataTransfer.files;
          tempFile = null;
        }

        console.log("on fileInput change: ", fileInput.files);
        setValidThumbnail(fileInput, uploadArea);
        addDeleteIcon(uploadArea);
        const carouselIndicators = modalElement.querySelector(
          ".carousel-indicators"
        );
        const indicatorsCount = carouselIndicators.children.length;
        if (
          fileInput.files.length > 0 &&
          attachedFilesCnt() + 1 > indicatorsCount
        ) {
          addCarouselItem();
        }
        const count = attachedFilesCnt();
        this.resetCarouselIndicators(count, modalElement);
        this.resetCarouselButtons(count + 1, modalElement);
      });
    };

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

    // textAreaにinputイベントリスナーを追加
    textInput.addEventListener("input", validateTextInput);
    validateTextInput(); // ページ読み込み時にもバリデーションチェックを行う
    setupUploadArea(modalElement.querySelector(".carousel-item.active"));

    // 編集モーダルからの遷移の場合 --------------------------------------------------
    if (event.target.dataset.post) {
      const post = JSON.parse(event.target.dataset.post);
      const cloudinaryName = event.target.dataset.cloud;
      const updatedAtField = modalElement.querySelector(".updated-at");
      textInput.value = post.content;
      updatedAtField.textContent = "最終更新日時: " + post.updated_at; // 最終更新日時を設定

      const form = document.querySelector("#editModal form");
      form.setAttribute("action", "/posts/" + post.id); // フォームのアクションを編集のURLに変更
      form.setAttribute("method", "patch"); // フォームのメソッドをPATCHに変更
      const deleteLink = document.querySelector(
        "#editModal .btn-outline-danger"
      );
      deleteLink.href = "/posts/" + post.id; // 削除リンクのhref属性を設定

      if (post.image_keys) {
        post.image_keys.forEach((imageKey, index) => {
          const imageUrl = `https://res.cloudinary.com/${cloudinaryName}/image/upload/${imageKey}`;
          if (index < 3) {
            addCarouselItem();
          }
          fetch(imageUrl)
            .then((response) => response.blob())
            .then((blob) => {
              const file = new File([blob], `${imageKey}.jpg`, {
                type: "image/jpeg",
              });
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              const carouselInner =
                modalElement.querySelector(".carousel-inner");
              const uploadArea =
                carouselInner.children[index].querySelector(".upload-area");
              const fileInput = uploadArea.querySelector(".file-input");
              fileInput.files = dataTransfer.files;
              setValidThumbnail(fileInput, uploadArea);
              addDeleteIcon(uploadArea);
            });
        });
        const carouselInner = modalElement.querySelector(".carousel-inner"); // debug
        console.log("on editModal: ", carouselInner);
        const count = post.image_keys.length;
        this.resetCarouselIndicators(count, modalElement);
        this.resetCarouselButtons(count, modalElement);
      }
    }
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
