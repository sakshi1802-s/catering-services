// 1) Retrieve or initialize cart array from localStorage
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

// 2) Select necessary elements
const plusButtons = document.querySelectorAll(".plus-btn");
const minusButtons = document.querySelectorAll(".minus-btn");
const cartCountEl = document.getElementById("cart-count");
const categoryBtns = document.querySelectorAll(".category-btn");
const menuSections = document.querySelectorAll(".menu-section");
const searchInput = document.getElementById("searchInput");
const cartIcon = document.getElementById("cartIcon");

// Update localStorage whenever cartItems changes
function updateLocalStorageCart() {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

// Calculate total items in cart
function updateCartCount() {
  let total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  cartCountEl.textContent = total;
}

// On page load, set the displayed quantity from cart data
function renderMenuQuantities() {
  document.querySelectorAll(".menu-item").forEach(menuItem => {
    const itemName = menuItem.dataset.name;
    const itemInCart = cartItems.find(item => item.name === itemName);
    menuItem.querySelector(".quantity").textContent = itemInCart ? itemInCart.quantity : 0;
  });
  updateCartCount();
}

// Add item to cart function
function addItemToCart(dishName, dishPrice) {
  const existingItem = cartItems.find(item => item.name === dishName);
  existingItem ? existingItem.quantity++ : cartItems.push({ name: dishName, price: parseInt(dishPrice), quantity: 1 });
  updateLocalStorageCart();
  updateCartCount();
}

// Decrement item from cart
function removeItemFromCart(dishName) {
  const existingItem = cartItems.find(item => item.name === dishName);
  if (existingItem) {
    existingItem.quantity > 1 ? existingItem.quantity-- : cartItems = cartItems.filter(item => item.name !== dishName);
    updateLocalStorageCart();
    updateCartCount();
  }
}

// 3) Plus button events
document.addEventListener("DOMContentLoaded", () => {
  plusButtons.forEach(btn => {
    btn.addEventListener("click", e => {
      const parentItem = e.target.closest(".menu-item");
      const itemName = parentItem.dataset.name;
      const itemPrice = parentItem.dataset.price;
      const quantitySpan = parentItem.querySelector(".quantity");
      quantitySpan.textContent = parseInt(quantitySpan.textContent) + 1;
      addItemToCart(itemName, itemPrice);
      cartIcon.classList.add("wiggle");
      setTimeout(() => cartIcon.classList.remove("wiggle"), 500);
    });
  });
});

// 4) Minus button events
document.addEventListener("DOMContentLoaded", () => {
  minusButtons.forEach(btn => {
    btn.addEventListener("click", e => {
      const parentItem = e.target.closest(".menu-item");
      const itemName = parentItem.dataset.name;
      const quantitySpan = parentItem.querySelector(".quantity");
      if (parseInt(quantitySpan.textContent) > 0) {
        quantitySpan.textContent = parseInt(quantitySpan.textContent) - 1;
        removeItemFromCart(itemName);
      }
    });
  });
});

// 5) Category filtering
document.addEventListener("DOMContentLoaded", () => {
  categoryBtns.forEach(button => {
    button.addEventListener("click", () => {
      categoryBtns.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      const category = button.dataset.category.toLowerCase();
      menuSections.forEach(section => section.style.display = (category === "all" || section.dataset.category.toLowerCase() === category) ? "block" : "none");
    });
  });
  document.querySelector('.category-btn[data-category="all"]').click();
});

// 6) Simple Search
searchInput.addEventListener("input", () => {
  const searchValue = searchInput.value.toLowerCase().trim();
  document.querySelectorAll(".menu-item").forEach(item => {
    item.style.display = item.querySelector("h3").textContent.toLowerCase().includes(searchValue) ? "block" : "none";
  });
});

// 7) On page load, render the correct quantities from cart
renderMenuQuantities();
