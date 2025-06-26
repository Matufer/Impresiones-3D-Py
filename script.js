function viewProduct(name, price, images, description, id) {
  localStorage.setItem(
    "currentProduct",
    JSON.stringify({ name, price, images, description, id })
  );
  window.location.href = "product.html";
}

document.addEventListener("DOMContentLoaded", () => {
  // --- PRODUCT PAGE ---
  const productNameEl = document.getElementById("productName");
  const productPriceEl = document.getElementById("productPrice");
  const productDescriptionEl = document.getElementById("productDescription");
  const carouselSlide = document.getElementById("carouselSlide"); // assuming your carousel container
  const dotsContainer = document.getElementById("carouselDots");
  const addToCartBtn = document.getElementById("addToCart");
  const prevBtn = document.getElementById("prevImage");
  const nextBtn = document.getElementById("nextImage");

  if (productNameEl && productPriceEl && addToCartBtn && carouselSlide) {
    const product = JSON.parse(localStorage.getItem("currentProduct"));
    if (product) {
      productNameEl.innerText = product.name || "";
      productPriceEl.innerText = `$${product.price.toFixed(2)}`;
      if (productDescriptionEl) productDescriptionEl.innerText = product.description || "";

      let images = [];
      if (Array.isArray(product.images) && product.images.length > 0) {
        images = product.images;
      } else if (typeof product.image === "string" && product.image) {
        images = [product.image]; // fallback
      }

      let currentImageIndex = 0;

      // Clear existing images and dots, then build carousel images and dots
      function updateCarousel() {
        // Clear old images & dots
        carouselSlide.innerHTML = "";
        dotsContainer.innerHTML = "";

        // Create image elements with proper widths
        images.forEach((src, index) => {
          const img = document.createElement("img");
          img.src = src;
          img.alt = product.name || "";
          img.style.width = "100%";
          img.style.flexShrink = "0";
          img.style.objectFit = "contain";
          carouselSlide.appendChild(img);

          const dot = document.createElement("button");
          dot.className = index === currentImageIndex ? "active" : "";
          dot.addEventListener("click", () => {
            currentImageIndex = index;
            slideToCurrentImage();
            updateDots();
          });
          dotsContainer.appendChild(dot);
        });

        // Set carouselSlide width dynamically
        carouselSlide.style.width = `${images.length * 100}%`;

        slideToCurrentImage();
        updateDots();
      }

      function slideToCurrentImage() {
        // Move carouselSlide to show current image
        carouselSlide.style.transform = `translateX(-${(currentImageIndex * 100) / images.length}%)`;
      }

      function updateDots() {
        Array.from(dotsContainer.children).forEach((dot, i) => {
          dot.classList.toggle("active", i === currentImageIndex);
        });
      }

      // Prev/Next button event handlers
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

  // Create a new product object for the cart, without mutating original
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
        img.src = firstImage || "img/default-placeholder.png"; // fallback image if missing
        img.alt = item.name;
        img.style.width = "60px";
        img.style.height = "60px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "10px";
        li.appendChild(img);

        const infoDiv = document.createElement("div");
        infoDiv.style.flexGrow = "1";
        infoDiv.innerHTML = `<strong>${item.name}</strong><br>$${item.price.toFixed(2)} x ${item.quantity}`;
        li.appendChild(infoDiv);

        const decBtn = document.createElement("button");
        decBtn.textContent = "−";
        decBtn.title = "Decrease quantity";
        decBtn.onclick = () => decreaseQuantity(item);
        li.appendChild(decBtn);

        const incBtn = document.createElement("button");
        incBtn.textContent = "+";
        incBtn.title = "Increase quantity";
        incBtn.onclick = () => increaseQuantity(item);
        li.appendChild(incBtn);

        cartList.appendChild(li);
      });

      totalDisplay.textContent = `Total: $${total.toFixed(2)}`;
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
      checkoutTotal.textContent = `$${total.toFixed(2)}`;
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
