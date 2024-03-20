import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    new bootstrap.Toast(this.element, { delay: 2000 }).show();
    console.log("Connected to ToastController");
  }
};
