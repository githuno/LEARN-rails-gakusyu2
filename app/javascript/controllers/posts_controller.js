import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  postsWidth =
    document.querySelector(".posts").offsetWidth -
    (document.querySelector(".posts").offsetWidth -
      document.querySelector(".posts").clientWidth);
  connect() {
    console.log("Connected to HorizontalScrollController");
    this.element.addEventListener("wheel", this.handleWheel.bind(this));
    this.element.addEventListener("scroll", this.handleScroll.bind(this));
    window.addEventListener("resize", this.handleResize.bind(this)); // resizeイベントをリッスン

    const cards = this.element.querySelectorAll(".posts_card");
    const endOfDataCard = this.element.querySelector(".end-of-data");

    // カードがendOfDataだけの場合
    if (cards.length === 1 && endOfDataCard) {
      // end-of-dataカードの前にN枚ののカードを追加
      for (let i = 0; i < 4; i++) {
        const firstCard = cards[0].cloneNode(true);
        firstCard.style.visibility = "hidden";
        this.element.prepend(firstCard);
      }
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

    cards.forEach((card) => {
      card.addEventListener("click", this.handleClick.bind(this));
      card.addEventListener("focus", this.handleFocus.bind(this)); // focusイベントをリッスン
    });

    // マウスが要素の上に乗ったときに自動スクロールを停止
    this.element.addEventListener("mouseover", this.handleMouseOver.bind(this));
    // マウスが要素から離れたときに自動スクロールを再開
    this.element.addEventListener("mouseout", this.handleMouseOut.bind(this));

    for (let i = 0; i < 5; i++) {
      const firstCard = cards[0].cloneNode(true);
      const lastCard = cards[cards.length - 1].cloneNode(true);
      firstCard.style.visibility = "hidden";
      lastCard.style.visibility = "hidden";
      this.element.prepend(firstCard);
      this.element.append(lastCard);
    }

    this.element.scrollLeft =
      cards[0].offsetLeft + cards[0].offsetWidth / 2 - this.postsWidth / 2;
    this.handleScroll();

    // 自動スクロールの設定
    let scrollAmount = 0;
    const scrollSpeed = 3; // スクロール速度を調整（大きいほど速くスクロール）
    this.autoScroll = () => {
      scrollAmount += scrollSpeed;
      this.element.scrollLeft = scrollAmount;
    };
    // 20ミリ秒ごとにautoScroll関数を実行
    // this.autoScrollInterval = setInterval(this.autoScroll, 20);
  }

  // マウスが要素の上に乗ったときに自動スクロールを停止
  handleMouseOver() {
    clearInterval(this.autoScrollInterval);
  }

  // マウスが要素から離れたときに自動スクロールを再開
  handleMouseOut() {
    this.autoScrollInterval = setInterval(this.autoScroll, 20);
  }

  // カードがフォーカスされたときに自動スクロールを停止
  handleFocus() {
    clearInterval(this.autoScrollInterval);
  }

  // コントローラが切断されたときに自動スクロールを停止
  disconnect() {
    clearInterval(this.autoScrollInterval);
  }

  handleWheel(event) {
    const cards = this.element.querySelectorAll(".posts_card");
    const endOfDataCard = this.element.querySelector(".end-of-data");

    // カードがendOfDataだけの場合
    if (cards.length === 1 && endOfDataCard) {
      event.preventDefault(); // スクロールを無効にする
      return; // 以降の処理をスキップ
    }
    console.log("Wheel event detected");
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
      // cardwidthはpostwidthが大きいとき(1280)は0に近づき、postwidthが小さいとき(350)はcardwidthに近づく
      const relativeCardWidth =
        cardWidth - (cardWidth * (this.postsWidth - 350)) / (1920 - 350);
      const cardMiddle = cardLeft + relativeCardWidth / 2; // カードの中心の位置
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
    const card = event.currentTarget;
    const cardLeft = card.offsetLeft;
    const cardWidth = card.offsetWidth;
    const relativeCardWidth =
      cardWidth - (cardWidth * (this.postsWidth - 350)) / (1920 - 350);
    const scrollbarWidth = this.postsWidth - this.element.clientWidth;
    const cardMiddle = cardLeft + relativeCardWidth / 2;
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
}
