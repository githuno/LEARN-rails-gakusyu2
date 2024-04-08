//= require jquery3
//= require popper
//= require bootstrap-sprockets

// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails";
import "controllers";
//= require rails-ujs

// postを開く
import ModalController from "./controllers/modal_controller";

console.log("イベント");
document.addEventListener('DOMContentLoaded', (event) => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('post');

  if (postId) {
    fetch(`/posts/${postId}`)
      .then(response => response.json())
      .then(data => {
        const post = data;
        const modalElement = document.getElementById("postModal");
        const carouselItem = modalElement.querySelector(".carousel-item");
        const carouselItemTemplate = carouselItem.cloneNode(true);

        const modalController = new ModalController();
        modalController.setImages(event, post.image_keys, modalElement, carouselItemTemplate);
        modalController.fillPostContent(post, modalElement);

        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          modalInstance.show();
        }
      });
  }
});