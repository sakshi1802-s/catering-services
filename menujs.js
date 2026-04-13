
// Attach event listeners for increase and decrease buttons
document.querySelectorAll('.increase').forEach(button => {
    button.addEventListener('click', () => {
        const itemBox = button.closest('.item-box');
        updateQuantity(itemBox, 1);
    });
});

document.querySelectorAll('.decrease').forEach(button => {
    button.addEventListener('click', () => {
        const itemBox = button.closest('.item-box');
        updateQuantity(itemBox, -1);
    });
});

// Modal logic for showing item details
document.querySelectorAll('.open-modal').forEach(image => {
    image.addEventListener('click', () => {
        const box = image.closest('.item-box');
        currentModalItemId = box.getAttribute('data-id');
        const title = box.getAttribute('data-title');
        const desc = box.getAttribute('data-description');
        const price = box.getAttribute('data-price');
        const img = box.getAttribute('data-img');

        document.getElementById('itemModalLabel').textContent = title;
        document.getElementById('modalDescription').textContent = desc;
        document.getElementById('modalPrice').textContent = `₹${price}`;
        document.getElementById('modalImage').src = img;

        $('#itemModal').modal('show');
    });
});



// Filter buttons logic
const filterButtons = document.querySelectorAll('.filter-btn');
const sections = document.querySelectorAll('.menu-section');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        sections.forEach(section => {
            section.style.display = (filter === 'all' || section.id === filter) ? '' : 'none';
        });
    });
});

// Search filter logic
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    document.querySelectorAll('.item-box').forEach(box => {
        const title = box.getAttribute('data-title').toLowerCase();
        box.parentElement.style.display = title.includes(searchTerm) ? 'block' : 'none';
    });
});


<script>
    let cart = { };

    // Add to Cart Buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const itemBox = button.closest('.item-box');
            const id = itemBox.getAttribute('data-id');
            const title = itemBox.getAttribute('data-title');
            const price = parseFloat(itemBox.getAttribute('data-price'));

            if (cart[id]) {
                cart[id].quantity += 1;
            } else {
                cart[id] = {
                    title,
                    price,
                    quantity: 1
                };
            }

            openCart();
            renderCart();
        });
    });

    function openCart() {
        document.getElementById('cartSidebar').classList.add('open');
    }

    document.getElementById('closeCart').addEventListener('click', () => {
        document.getElementById('cartSidebar').classList.remove('open');
    });

    function renderCart() {
        const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = ''; // Clear previous

    let total = 0;

    for (let id in cart) {
            const item = cart[id];
    total += item.price * item.quantity;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
    <div class="cart-item-title">${item.title}</div>
    <div class="cart-item-controls">
        <button class="btn btn-sm btn-outline-secondary decrease-cart" data-id="${id}">-</button>
        <span>${item.quantity}</span>
        <button class="btn btn-sm btn-outline-secondary increase-cart" data-id="${id}">+</button>
    </div>
    `;
    cartItemsContainer.appendChild(cartItem);
        }

    document.getElementById('cartTotal').textContent = total.toFixed(2);

        // Add event listeners for increase and decrease buttons inside cart
        document.querySelectorAll('.decrease-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            if (cart[id].quantity > 1) {
                cart[id].quantity -= 1;
            } else {
                delete cart[id];
            }
            renderCart();
        });
        });

        document.querySelectorAll('.increase-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            cart[id].quantity += 1;
            renderCart();
        });
        });
    }
</script>
