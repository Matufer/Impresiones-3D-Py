function viewProduct(name, price) {
  localStorage.setItem("currentProduct", JSON.stringify({ name, price }));
  window.location.href = "product.html";
}

document.addEventListener("DOMContentLoaded", () => {
  // Load product page
  const product = JSON.parse(localStorage.getItem("currentProduct"));
  if (product && document.getElementById("productName")) {
    document.getElementById("productName").innerText = product.name;
    document.getElementById("productPrice").innerText = `$${product.price.toFixed(2)}`;
  }

  // Add to cart
  const addBtn = document.getElementById("addToCart");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart.push(product);
      localStorage.setItem("cart", JSON.stringify(cart));
      alert("Added to cart!");
    });
  }

  // Load cart
  const cartList = document.getElementById("cartItems");
  if (cartList) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    let total = 0;
    cart.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name} - $${item.price.toFixed(2)}`;
      cartList.appendChild(li);
      total += item.price;
    });
    const totalDisplay = document.getElementById("totalPrice");
    if (totalDisplay) {
      totalDisplay.textContent = `Total: $${total.toFixed(2)}`;
    }
  }

  // Clear cart
  const clearBtn = document.getElementById("clearCart");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem("cart");
      location.reload();
    });
  }

  // Payment form link with product list
  const paymentFormLink = document.getElementById("paymentFormLink");
  if (paymentFormLink) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const names = cart.map(p => p.name).join(', ');
    const base = "https://docs.google.com/forms/d/e/1FAIpQLSfekmdBwfZJTPKkOqDsy0kKz3Fp7bfq649KP5-CB0wnNvcmQg/viewform";
    const entryId = "930752464";
    paymentFormLink.href = `${base}?usp=pp_url&entry.${entryId}=${encodeURIComponent(names)}`;
  }

  // Show total price on checkout page
  const checkoutTotal = document.getElementById("checkoutTotal");
  if (checkoutTotal) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    checkoutTotal.textContent = `$${total.toFixed(2)}`;
  }

  // Live search
  const search = document.getElementById("searchInput");
  if (search) {
    search.addEventListener("input", () => {
      const term = search.value.toLowerCase();
      document.querySelectorAll(".product-card").forEach(card => {
        const name = card.querySelector("h3").innerText.toLowerCase();
        card.style.display = name.includes(term) ? "block" : "none";
      });
    });
  }

  // Category filtering
  const categoryButtons = document.querySelectorAll(".category-btn");
  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      categoryButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      const selected = button.dataset.category;
      document.querySelectorAll(".product-card").forEach(card => {
        const category = card.dataset.category;
        card.style.display = selected === "all" || category === selected ? "block" : "none";
      });
      if (search) search.value = "";
    });
  });
});