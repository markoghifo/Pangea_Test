// const client = contentful.createClient({
//   // This is the space ID. A space is like a project folder in Contentful terms
//   space: "dm2zhs7qdtugd",
//   // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
//   accessToken: "DcMw94YMDEimoSUiD1CmiCD-Hsmz7RpKiJrvQXGKrQ0",
// });
// This API call will request an entry with the specified ID from the space defined at the top, using a space-specific access token.

// variables
const cartButton = document.querySelector(".cartbtn");
const closeCartButton = document.querySelector(".close");
const clearCartButton = document.querySelector(".clear-cart");
const removeCart = document.querySelector(".remove-item");
const cartOverlay = document.querySelector(".cart-overlay");
const cartDOM = document.querySelector(".cart");
const cartItems = document.querySelector(".cartitems ");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productDOM = document.querySelector(".products-center");
const accDOM = document.querySelectorAll(".acckrd-header");

accDOM.forEach((acc) => {
  acc.addEventListener("click", () => {
    let accordAct = document.querySelector(".acckrd-header.active");
    if (accordAct && accordAct !== acc) {
      accordAct.classList.toggle("active");
      accordAct.nextElementSibling.style.maxHeight = 0;
    }

    acc.classList.toggle("active");
    const accordBody = acc.nextElementSibling;
    if (acc.classList.contains("active")) {
      accordBody.style.maxHeight = accordBody.scrollHeight + "px";
    } else {
      accordBody.style.maxHeight = 0;
    }
  });
});
// cart
let cart = [];

// button

let btnDOM = [];

// creating class known as syntax sugar; a feature of es6. Read more..
// getting the products
class Products {
  async getProducts() {
    try {
      // let contentful = await client.getEntries();
      // console.log(contentful);

      let result = await fetch("products.json");
      let data = await result.json();

      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const image = item.fields.image.fields.file.url;
        const { id } = item.sys;
        return { title, price, image, id };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    let innerProduct = "";
    products.forEach((product) => {
      innerProduct += `<article class="product">
          <div class="img-container">
            <img
              src='${product.image}'
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fa fa-shopping-cart" aria-hidden="true">add to cart</i>
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>`;
    });
    productDOM.innerHTML = innerProduct;
  }

  buttonDisplay() {
    const buyBtn = [...document.querySelectorAll(".bag-btn")];
    btnDOM = buyBtn;
    buyBtn.forEach((button) => {
      let id = button.dataset.id;
      let incart = cart.find((item) => item.id === id);

      if (incart) {
        button.innerText = "in cart";
        button.disabled = true;
      }
      button.addEventListener("click", (e) => {
        e.target.innerText = "in cart";
        e.target.disabled = true;
        // get prdt from local storage
        let cartItem = { ...Storage.getprdts(id), amount: 1 };
        // add to cart
        cart = [...cart, cartItem];
        // save cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setValue(cart);
        // display cart item
        this.addcart(cartItem);
        // show cart
        this.showCart();
      });
    });
  }
  setValue(cart) {
    let tempTotal = 0;
    let itemTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemTotal;
  }

  addcart(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = ` <img src=${item.image} alt="product" />
            <div>
              <h4>${item.title}</h4>
              <h5>${item.price}</h5>
              <span class="remove-item" data-id= ${item.id}>remove</span>
            </div>
            <div>
              <i class="fa fa-chevron-up"  data-id= ${item.id} aria-hidden="true"></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fa fa-chevron-down"  data-id= ${item.id} aria-hidden="true"></i>
            </div>
            `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
    // event listener to close cart section
  }
  hidecart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  setupApp() {
    cart = Storage.getCart();
    this.setValue(cart);
    this.populate(cart);
    cartButton.addEventListener("click", this.showCart);
    closeCartButton.addEventListener("click", this.hidecart);
    // console.log(this);
  }

  populate(cart) {
    cart.forEach((item) => this.addcart(item));
  }

  logiccART() {
    clearCartButton.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", (e) => {
      let id = e.target.dataset.id;
      if (e.target.classList.contains("remove-item")) {
        this.removeItem(id);
        cartContent.removeChild(e.target.parentElement.parentElement);
      } else if (e.target.classList.contains("fa-chevron-up")) {
        let tempAmt = cart.find((item) => item.id === id);
        tempAmt.amount = tempAmt.amount + 1;
        e.target.nextElementSibling.innerText = tempAmt.amount;
        Storage.saveCart(cart);
        this.setValue(cart);
      } else if (e.target.classList.contains("fa-chevron-down")) {
        let tempAmt = cart.find((item) => item.id === id);
        tempAmt.amount = tempAmt.amount - 1;
        if (tempAmt.amount > 0) {
          e.target.previousElementSibling.innerText = tempAmt.amount;
          Storage.saveCart(cart);
          this.setValue(cart);
        } else {
          cartContent.removeChild(e.target.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    // get all the items of the cart, precisely the ids
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hidecart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setValue(cart);
    Storage.saveCart(cart);
    let button = this.getSingleBtn(id);
    button.disabled = false;
    button.innerHTML = `<div><i class="fa fa-shopping-cart"></i> add to cart</div>`;
  }
  getSingleBtn(id) {
    return btnDOM.find((button) => button.dataset.id === id);
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getprdts(id) {
    let prdts = JSON.parse(localStorage.getItem("products"));
    return prdts.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const product = new Products();
  // setup app
  ui.setupApp();
  //  get all products
  product
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.buttonDisplay();
      ui.logiccART();
    });
});
