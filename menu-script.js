// 1) Retrieve or initialize cart array from localStorage
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

// 2) Select necessary elements
const plusButtons = document.querySelectorAll(".plus-btn");
const minusButtons = document.querySelectorAll(".minus-btn");
const cartCountEl = document.getElementById("cart-count");
const categoryBtns = document.querySelectorAll(".category-btn");
const menuSections = document.querySelectorAll(".menu-section");
const searchInput = document.getElementById("searchInput");

// Update localStorage whenever cartItems changes
function updateLocalStorageCart() {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

// Calculate total items in cart
function updateCartCount() {
  let total = 0;
  cartItems.forEach(item => {
    total += item.quantity;
  });
  cartCountEl.textContent = total;
}

// On page load, set the displayed quantity from cart data
function renderMenuQuantities() {
  // For each .menu-item, see if it's in cartItems
  document.querySelectorAll(".menu-item").forEach((menuItem) => {
    const itemName = menuItem.dataset.name;
    const itemInCart = cartItems.find(item => item.name === itemName);

    const quantitySpan = menuItem.querySelector(".quantity");
    if (itemInCart) {
      quantitySpan.textContent = itemInCart.quantity;
    } else {
      quantitySpan.textContent = 0;
    }
  });
  updateCartCount();
}

// Add item to cart function
function addItemToCart(dishName, dishPrice) {
  // Check if item already in cart
  const existingItem = cartItems.find(item => item.name === dishName);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cartItems.push({
      name: dishName,
      price: parseInt(dishPrice),
      quantity: 1
    });
  }
  updateLocalStorageCart();
  updateCartCount();
}

// Decrement item from cart
function removeItemFromCart(dishName) {
  const existingItem = cartItems.find(item => item.name === dishName);
  if (existingItem) {
    if (existingItem.quantity > 1) {
      existingItem.quantity--;
    } else {
      // If quantity is 1 and user clicks "-", remove the item
      cartItems = cartItems.filter(item => item.name !== dishName);
    }
    updateLocalStorageCart();
    updateCartCount();
  }
}

// 3) Plus button events
plusButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const parentItem = e.target.closest(".menu-item");
    const itemName = parentItem.dataset.name;
    const itemPrice = parentItem.dataset.price;
    // Increment UI
    const quantitySpan = parentItem.querySelector(".quantity");
    let currentQty = parseInt(quantitySpan.textContent);
    currentQty++;
    quantitySpan.textContent = currentQty;

    // Update cart
    addItemToCart(itemName, itemPrice);
  });
});

// 4) Minus button events
minusButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const parentItem = e.target.closest(".menu-item");
    const itemName = parentItem.dataset.name;
    // Decrement UI
    const quantitySpan = parentItem.querySelector(".quantity");
    let currentQty = parseInt(quantitySpan.textContent);
    if (currentQty > 0) {
      currentQty--;
      quantitySpan.textContent = currentQty;
      // Update cart
      removeItemFromCart(itemName);
    }
  });
});

// 5) Category Filtering
categoryBtns.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove 'active' from all buttons
    categoryBtns.forEach((btn) => btn.classList.remove("active"));
    // Add 'active' to current button
    button.classList.add("active");

    const category = button.getAttribute("data-category");

    if (category === "all") {
      // Show all sections
      menuSections.forEach((section) => {
        section.style.display = "block";
      });
    } else {
      // Show only the section with matching data-category
      menuSections.forEach((section) => {
        if (section.getAttribute("data-category") === category) {
          section.style.display = "block";
        } else {
          section.style.display = "none";
        }
      });
    }
  });
});

// 6) Simple Search
searchInput.addEventListener("input", () => {
  const searchValue = searchInput.value.toLowerCase().trim();
  const allItems = document.querySelectorAll(".menu-item");

  allItems.forEach((item) => {
    const dishName = item.querySelector("h3").textContent.toLowerCase();
    if (dishName.includes(searchValue)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
});

// 7) On page load, render the correct quantities from cart
renderMenuQuantities();
