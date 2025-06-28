function formatPrice(number) {
  return number.toLocaleString('es-PY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// --- PRODUCT PAGE ---
function viewProduct(name, price, images, description, id) {
  localStorage.setItem(
    "currentProduct",
    JSON.stringify({ name, price, images, description, id })
  );
  window.location.href = "product.html";
}

document.addEventListener("DOMContentLoaded", () => {
  // Product page elements
  const productNameEl = document.getElementById("productName");
  const productPriceEl = document.getElementById("productPrice");
  const productDescriptionEl = document.getElementById("productDescription");
  const carouselSlide = document.getElementById("carouselSlide");
  const dotsContainer = document.getElementById("carouselDots");
  const addToCartBtn = document.getElementById("addToCart");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");

  if (productNameEl && productPriceEl && addToCartBtn && carouselSlide) {
    const product = JSON.parse(localStorage.getItem("currentProduct"));
    if (product) {
      productNameEl.innerText = product.name || "";
      productPriceEl.innerText = `₲${formatPrice(product.price)}`;
      if (productDescriptionEl) productDescriptionEl.innerText = product.description || "";

      let images = [];
      if (Array.isArray(product.images) && product.images.length > 0) {
        images = product.images;
      } else if (typeof product.image === "string" && product.image) {
        images = [product.image];
      }

      let currentImageIndex = 0;

      function updateCarousel() {
        carouselSlide.innerHTML = "";
        dotsContainer.innerHTML = "";

        images.forEach((src, index) => {
          const img = document.createElement("img");
          img.src = src;
          img.alt = product.name || "";
          img.style.width = "100%";
          img.style.flexShrink = "0";
          img.style.objectFit = "contain";
          carouselSlide.appendChild(img);

          const dot = document.createElement("span");
          dot.className = "carousel-dot" + (index === currentImageIndex ? " active" : "");
          dot.addEventListener("click", () => {
            currentImageIndex = index;
            slideToCurrentImage();
            updateDots();
          });
          dotsContainer.appendChild(dot);
        });

        slideToCurrentImage();
        updateDots();
      }

      function slideToCurrentImage() {
        carouselSlide.style.transform = `translateX(-${currentImageIndex * 100}%)`;
      }

      function updateDots() {
        Array.from(dotsContainer.children).forEach((dot, i) => {
          dot.classList.toggle("active", i === currentImageIndex);
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
          slideToCurrentImage();
          updateDots();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          currentImageIndex = (currentImageIndex + 1) % images.length;
          slideToCurrentImage();
          updateDots();
        });
      }

      updateCarousel();

      addToCartBtn.addEventListener("click", () => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        const productForCart = {
          ...product,
          images: Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : (product.image ? [product.image] : ["img/default-placeholder.png"])
        };

        cart.push(productForCart);
        localStorage.setItem("cart", JSON.stringify(cart));
        alert("¡Agregado al carrito!");
      });
    }
  }

  // --- CART PAGE ---
  const cartList = document.getElementById("cartItems");
  const totalDisplay = document.getElementById("totalPrice");
  const clearBtn = document.getElementById("clearCart");

  if (cartList && totalDisplay) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function groupCartItems(cart) {
      const grouped = {};
      cart.forEach(item => {
        const key = item.id || item.name;
        if (!grouped[key]) {
          grouped[key] = { ...item, quantity: 0 };
        }
        grouped[key].quantity++;
      });
      return Object.values(grouped);
    }

    function renderCart() {
      cartList.innerHTML = "";
      const groupedItems = groupCartItems(cart);
      let total = 0;

      groupedItems.forEach(item => {
        total += item.price * item.quantity;

        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.gap = "12px";

        const img = document.createElement("img");
        const firstImage = Array.isArray(item.images) ? item.images[0] : item.image;
        img.src = firstImage || "img/default-placeholder.png";
        img.alt = item.name;
        img.style.width = "60px";
        img.style.height = "60px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "10px";
        li.appendChild(img);

        const infoDiv = document.createElement("div");
        infoDiv.style.flexGrow = "1";
        infoDiv.innerHTML = `<strong>${item.name}</strong><br>₲${formatPrice(item.price)} x ${item.quantity}`;
        li.appendChild(infoDiv);

        const decBtn = document.createElement("button");
        decBtn.textContent = "−";
        decBtn.title = "Disminuir cantidad";
        decBtn.onclick = () => decreaseQuantity(item);
        li.appendChild(decBtn);

        const incBtn = document.createElement("button");
        incBtn.textContent = "+";
        incBtn.title = "Aumentar cantidad";
        incBtn.onclick = () => increaseQuantity(item);
        li.appendChild(incBtn);

        cartList.appendChild(li);
      });

      totalDisplay.textContent = `Total: ₲${formatPrice(total)}`;
    }

    function increaseQuantity(item) {
      cart.push({ ...item });
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    }

    function decreaseQuantity(item) {
      const index = cart.findIndex(c => (c.id ? c.id === item.id : c.name === item.name));
      if (index > -1) {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
      }
    }

    clearBtn?.addEventListener("click", () => {
      localStorage.removeItem("cart");
      cart = [];
      renderCart();
    });

    renderCart();
  }

  // --- CHECKOUT PAGE ---
  const paymentFormLink = document.getElementById("paymentFormLink");
  const checkoutTotal = document.getElementById("checkoutTotal");
  if (paymentFormLink || checkoutTotal) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    let total = 0;

    const grouped = {};
    cart.forEach(item => {
      const key = item.id || item.name;
      if (!grouped[key]) grouped[key] = 0;
      grouped[key]++;
      total += item.price;
    });

    const formatted = Object.entries(grouped)
      .map(([id, qty]) => `${id} (x${qty})`)
      .join(", ");

    if (checkoutTotal) {
      checkoutTotal.textContent = `₲${formatPrice(total)}`;
    }

    if (paymentFormLink) {
      const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfekmdBwfZJTPKkOqDsy0kKz3Fp7bfq649KP5-CB0wnNvcmQg/viewform";
      const entryId = "930752464";
      paymentFormLink.href = `${baseUrl}?usp=pp_url&entry.${entryId}=${encodeURIComponent(formatted)}`;
    }
  }

  // --- SEARCH & CATEGORY ---
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.toLowerCase();
      document.querySelectorAll(".product-card").forEach(card => {
        const name = card.querySelector("h3").innerText.toLowerCase();
        card.style.display = name.includes(term) ? "block" : "none";
      });
    });
  }

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
      if (searchInput) searchInput.value = "";
    });
  });
});
