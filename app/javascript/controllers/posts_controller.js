import { Controller } from "@hotwired/stimulus";

class ScrollController extends Controller {
  autoScrollInterval = null;
  // postsWidth =
  //   document.querySelector(".posts").offsetWidth -
  //   (document.querySelector(".posts").offsetWidth -
  //     document.querySelector(".posts").clientWidth);
  posts = null;
  postsWidth = null;
  cards = null;

  connect() {
    console.log("Connected to HorizontalController");
    // window.addEventListener("resize", this.handleResize.bind(this));
    // const cards = this.element.querySelectorAll(".posts_card");
    this.posts = document.querySelector(".posts");
    this.postsWidth = this.getPostsWidth();
    this.cards = this.element.querySelectorAll(".posts_card");



    // カード1枚だけの場合
    if (cards.length === 1) {
      cards[0].classList.add("w-full");

      // .postsのスクロールバーを削除
      const scrollbarWidth = this.postsWidth - this.element.clientWidth;
      this.element.style.paddingBottom = "0";
      this.element.style.marginRight = `-${scrollbarWidth}px`;
      this.element.style.overflowX = "hidden";
      this.element.style.scrollbarWidth = "none";
      this.element.style.msOverflowStyle = "none";
      this.element.style.pointerEvents = "none";
      return; // 以降の処理をスキップ
    }

    // 各種イベントリスナーを追加
    window.addEventListener("resize", this.debounce(this.handleResize.bind(this), 250));
    this.element.addEventListener("wheel", this.debounce(this.handleWheel.bind(this), 250));
    this.element.addEventListener("scroll", this.debounce(this.handleScroll.bind(this), 250));
    this.element.addEventListener("mouseover", this.handleMouseOver.bind(this));
    this.element.addEventListener("mouseout", this.handleMouseOut.bind(this));
    this.cards.forEach((card) => {
      card.addEventListener("click", this.handleClick.bind(this));
      card.addEventListener("focus", this.handleFocus.bind(this));
    });

    // カードの前後にN枚のカードを追加
    for (let i = 0; i < 5; i++) {
      const firstCard = cards[0].cloneNode(true);
      const lastCard = cards[cards.length - 1].cloneNode(true);
      firstCard.style.visibility = "hidden";
      lastCard.style.visibility = "hidden";
      firstCard.classList.add("hidden");
      lastCard.classList.add("hidden");
      this.element.prepend(firstCard);
      this.element.append(lastCard);
    }

    // カードのスクロール位置を調整
    this.element.scrollLeft =
      cards[0].offsetLeft + cards[0].offsetWidth / 2 - this.postsWidth / 2;
    this.handleScroll();

    // 自動スクロールの設定
    let scrollAmount = 0;
    const scrollSpeed = 5; // スクロール速度を調整（大きいほど速くスクロール）
    this.autoScroll = () => {
      scrollAmount += scrollSpeed;
      this.element.scrollLeft = scrollAmount;
    };

    // 自動スクロールを開始
    this.startAutoScroll();
  }

  startAutoScroll() {
    // 既に自動スクロールが開始されている場合は、それを停止
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
    this.autoScrollInterval = setInterval(this.autoScroll, 20);
  }

  // マウスが要素の上に乗ったときに自動スクロールを停止
  handleMouseOver() {
    clearInterval(this.autoScrollInterval);
  }

  // カードがフォーカスされたときに自動スクロールを停止
  handleFocus() {
    clearInterval(this.autoScrollInterval);
  }

  // コントローラが切断されたときに自動スクロールを停止
  disconnect() {
    clearInterval(this.autoScrollInterval);
  }

  // マウスが要素から離れたときに自動スクロールを再開
  handleMouseOut() {
    this.startAutoScroll();
  }

  handleWheel(event) {
    const cards = this.element.querySelectorAll(".posts_card");
    const endOfDataCard = this.element.querySelector(".end-of-data");

    // カードがendOfDataだけの場合
    if (cards.length === 1 && endOfDataCard) {
      event.preventDefault(); // スクロールを無効にする
      return; // 以降の処理をスキップ
    }
    if (event.deltaY !== 0) {
      event.preventDefault();
      this.element.scrollLeft += event.deltaY;
    }
  }

  handleScroll(event) {
    const cards = this.element.querySelectorAll(".posts_card");
    const scrollbarWidth = this.postsWidth - this.element.clientWidth;
    const center =
      this.element.scrollLeft + this.postsWidth / 2 - scrollbarWidth / 2;

    cards.forEach((card) => {
      const cardLeft = card.offsetLeft;
      const cardWidth = card.offsetWidth;
      const cardMiddle = cardLeft + cardWidth / 2; // カードの中心の位置
      const distance = Math.abs(center - cardMiddle); // カードの中心とスクロールバーの中心の距離
      const scale = Math.max(0.5, 1 - distance / this.postsWidth); // カードの拡大率
      const rotationY = (distance / this.postsWidth) * 45; // カードのY軸回転角度
      card.style.transform = `rotateY(${rotationY}deg) scale(${scale})`; // カードの回転と拡大
      card.style.zIndex = 1000 - Math.round(distance); // カードの重なり順
    });
  }

  handleClick(event) {
    const cards = this.element.querySelectorAll(".posts_card");
    const endOfDataCard = this.element.querySelector(".end-of-data");

    // カードがendOfDataだけの場合
    if (cards.length === 1 && endOfDataCard) {
      return; // 以降の処理をスキップ
    }
    const scrollbarWidth = this.postsWidth - this.element.clientWidth;
    const card = event.currentTarget;
    const cardLeft = card.offsetLeft;
    const cardWidth = card.offsetWidth;
    const cardMiddle = cardLeft + cardWidth / 2;
    const scrollLeft = cardMiddle - this.postsWidth / 2 + scrollbarWidth / 2; // scrollbarWidthを2で割って中心を考慮
    this.element.scrollLeft = scrollLeft;
  }

  // resizeイベントが発生したときにpostsWidthを再取得
  handleResize() {
    this.postsWidth =
      document.querySelector(".posts").offsetWidth -
      (document.querySelector(".posts").offsetWidth -
        document.querySelector(".posts").clientWidth);
    this.handleScroll(); // postsWidthが更新された後にhandleScrollを呼び出す
  }

  getPostsWidth() {
    return this.posts.offsetWidth - (this.posts.offsetWidth - this.posts.clientWidth);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}
// -----------------------------------------------------------------------------
class LoadController extends ScrollController {
  isLoading = false; // 新しい状態を追加

  connect() {
    console.log("Connected to LoadController");
    super.connect();
    this.element.addEventListener("scroll", this.loadMorePosts.bind(this));
    this.myId = this.element.dataset.myId;
    this.tlType = this.element.dataset.tlType;
  }

  scrollChecker() {
    // （水平）スクロール位置が一定の位置に達したかどうかをチェック
    const postsCards = Array.from(this.element.querySelectorAll(".posts_card"));
    const endOfDataIndex = postsCards.findIndex((card) =>
      card.classList.contains("end-of-data")
    );
    const targetCard = postsCards[endOfDataIndex - 10];
    if (!targetCard) {
      return false;
    }
    const rect = targetCard.getBoundingClientRect();
    // targetCardの左端が表示領域の左端を超えたかどうかをチェック
    return (
      targetCard &&
      rect.left + rect.width <=
        this.element.getBoundingClientRect().left + this.element.clientWidth
    );
  }

  insertNewPosts(data) {
    data.forEach((post) => {
      const newCard = document.createElement("div");
      newCard.classList.add("posts_card");
      newCard.innerHTML = `
        <div class="card-body d-flex flex-column justify-content-between">
          <div class="top-content">
            <p class="h5 card-title">${post.content}</p>
            <p class="card-text">${post.updated_at}</p>
          </div>
          <div class="bottom-content">
            <hr>
            <div class="d-flex justify-content-between">
            ${
              post.user_id != this.myId
                ? `
              <p class="card-text">
                <button class="btn btn-outline-secondary"
                        data-action="click->modal#showUser"
                        data-bs-target="#userModal"
                        data-bs-toggle="modal"
                        data-controller="modal"
                        data-modal-type="user"
                        data-user-id="${post.user_id}">
                  ${post.username}
                </button>
              </p>
              ${
                this.myId
                  ? `
              <button class="btn mb-4 toggleFollow btn-outline-primary"
                      data-action="click->follow#toggleFollow"
                      data-controller="follow"
                      data-is-followed="${post.following}"
                      data-user-id="${post.user_id}">
                  ${post.following ? "フォロー解除" : "フォロー"}
              </button>
              `
                  : ``
              }
            `
                : `
              <p class="card-text">
              </p>
              <button class="btn mb-4 btn-secondary"
                      data-bs-toggle: "modal"
                      data-bs-target: "#editModal"
                      data-controller="modal"
                      data-modal-type: "post"
                      data-post-id: "${post.id}"
                      data-post-content: "${post.content}"
                      data-post-updated-at: "${post.updated_at}"
                      data-action="click->modal#edit">
                  編集
              </button>
            `
            }
            </div>
          </div>
        </div>
      `;

      // イベントリスナーを追加
      newCard.addEventListener("click", this.handleClick.bind(this));
      // .end-of-dataクラスが付与されている最初のカードをtargetCardとし、その前に新しいカードを追加
      const targetCard = this.element.querySelector(".posts_card.end-of-data");
      this.element.insertBefore(newCard, targetCard);
    });
  }

  async loadMorePosts() {
    if (this.isLoading) return; // 新しいポストを取得している間は関数の実行をスキップ
    if (this.scrollChecker()) {
      console.log("run loadMorePosts()");
      this.isLoading = true; // 新しいポストを取得開始

      const totalCards = this.element.querySelectorAll(".posts_card").length;
      const hiddenCards =
        this.element.querySelectorAll(".posts_card.hidden").length;
      const start = totalCards - hiddenCards - 1;
      try {
        const response = await fetch(
          `/posts/more?start=${start}&type=${this.tlType}`
        );
        const data = await response.json();
        this.insertNewPosts(data);

        this.isLoading = false; // 新しいポストを取得完了
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }
}

const PostsController = LoadController;
export default PostsController;
