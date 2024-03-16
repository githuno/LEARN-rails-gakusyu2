import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  postsWidth = document.querySelector(".posts").offsetWidth;

  connect() {
    console.log("Connected to HorizontalScrollController");
    this.element.addEventListener("wheel", this.handleWheel.bind(this));
    this.element.addEventListener("scroll", this.handleScroll.bind(this));
    window.addEventListener("resize", this.handleResize.bind(this)); // resizeイベントをリッスン

    const cards = this.element.querySelectorAll(".card");
    cards.forEach((card) => {
      card.addEventListener("click", this.handleClick.bind(this));
    });

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
  }

  handleWheel(event) {
    console.log("Wheel event detected");
    if (event.deltaY !== 0) {
      event.preventDefault();
      this.element.scrollLeft += event.deltaY;
    }
  }

  handleScroll(event) {
    const cards = this.element.querySelectorAll(".card");
    const center = this.element.scrollLeft + this.postsWidth / 2;

    cards.forEach((card) => {
      const cardMiddle = card.offsetLeft + card.offsetWidth / 2; // カードの中心の位置
      const distance = Math.abs(center - cardMiddle); // カードの中心とスクロールバーの中心の距離
      const scale = Math.max(0.5, 1 - distance / this.postsWidth); // カードの拡大率
      const rotationY = (distance / this.postsWidth) * 45; // カードのY軸回転角度
      card.style.transform = `rotateY(${rotationY}deg) scale(${scale})`; // カードの回転と拡大
      card.style.zIndex = 1000 - Math.round(distance); // カードの重なり順
    });
  }

  handleClick(event) {
    const card = event.currentTarget;
    const cardLeft = card.offsetLeft;
    const cardWidth = card.offsetWidth;
    const scrollbarWidth = this.postsWidth - this.element.clientWidth;
    const cardMiddle = cardLeft + cardWidth / 2;
    const scrollLeft = cardMiddle - this.postsWidth / 2 + scrollbarWidth;
    this.element.scrollLeft = scrollLeft;
  }

  // resizeイベントが発生したときにpostsWidthを再取得
  handleResize() {
    this.postsWidth = document.querySelector(".posts").offsetWidth;
    this.handleScroll(); // postsWidthが更新された後にhandleScrollを呼び出す
  }
}