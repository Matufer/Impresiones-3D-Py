// --- UTILIDADES ---
function formatPrice(number) {
  return number.toLocaleString('es-PY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// --- NAVEGACIÓN A PRODUCTO ---
function viewProduct(product) {
  localStorage.setItem("currentProduct", JSON.stringify(product));
  window.location.href = "product.html";
}

// --- FUNCIÓN DE FILTRADO UNIFICADA ---
function aplicarFiltros() {
  const searchInput = document.getElementById("searchInput");
  const term = searchInput ? searchInput.value.toLowerCase().trim() : "";
  
  const btnActivo = document.querySelector(".category-btn.active");
  const selectedCategory = btnActivo ? btnActivo.dataset.category : "all";

  const cards = document.querySelectorAll(".product-card");

  // --- DENTRO DE aplicarFiltros() ---
cards.forEach(card => {
    const name = card.querySelector("h3").innerText.toLowerCase();
    
    // Usamos || "" para que si no hay categoría, no tire error el .includes
    const category = (card.dataset.category || "").toLowerCase();
    const term = searchInput.value.toLowerCase().trim();
    const selectedCategory = btnActivo ? btnActivo.dataset.category.toLowerCase() : "all";

    const coincideNombre = name.includes(term);
    
    // Lógica mejorada:
    const coincideCat = (selectedCategory === "all" || category.includes(selectedCategory));

    if (coincideNombre && coincideCat) {
        card.style.setProperty('display', 'flex', 'important');
    } else {
        card.style.setProperty('display', 'none', 'important');
    }
});
}

// --- CARGA DEL CATÁLOGO DESDE JSON ---
async function cargarCatalogo() {
  const grid = document.querySelector(".product-grid");
  if (!grid) return; 

  try {
    const response = await fetch("productos.json");
    if (!response.ok) throw new Error("No se pudo cargar productos.json");
    
    const productos = await response.json();
    grid.innerHTML = ""; 

    productos.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.dataset.category = p.category;
      
      const mainImg = p.images && p.images[0] ? p.images[0] : 'images/placeholder.jpg';
      const stockAvailable = p.stock !== undefined ? p.stock : "Consultar";

      card.innerHTML = `
        <img src="${mainImg}" alt="${p.name}" />
        <div class="product-info">
          <h3>${p.name}</h3>
          <p>₲${formatPrice(p.price)}</p>
          <p style="font-size: 0.85rem; color: #000; font-weight: bold; margin-bottom: 15px;">Disponible: ${stockAvailable}</p>
        </div>
        <button type="button" class="btn-ver">Ver</button>
      `;

      // Evento de click al botón
      card.querySelector(".btn-ver").onclick = () => viewProduct(p);
      
      grid.appendChild(card);
    });

    // Aplicar filtros inmediatamente después de cargar por si hay algo en el buscador
    aplicarFiltros();

  } catch (e) {
    console.error("Error cargando el catálogo:", e);
    grid.innerHTML = `<p style="color:red; grid-column: 1/-1; text-align:center;">Error al cargar productos.</p>`;
  }
}

// --- LÓGICA PRINCIPAL AL CARGAR EL DOM ---
document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Iniciar carga de catálogo
  cargarCatalogo();

  // 2. Configurar Buscador
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", aplicarFiltros);
  }

  // 3. Configurar Botones de Categoría
  const categoryButtons = document.querySelectorAll(".category-btn");
  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      categoryButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      aplicarFiltros();
    });
  });

  // 4. PÁGINA DE DETALLE (product.html)
  const productNameEl = document.getElementById("productName");
  if (productNameEl) {
    const product = JSON.parse(localStorage.getItem("currentProduct"));
    if (product) {
      document.getElementById("productPrice").innerText = `₲${formatPrice(product.price)}`;
      productNameEl.innerText = product.name;
      
      const descEl = document.getElementById("productDescription");
      if (descEl) {
        const baseDesc = product.description || "Sin descripción disponible.";
        const stockHTML = product.stock !== undefined 
          ? `<br><br><strong class="stock-display">Disponible: ${product.stock}</strong>` 
          : "";
        descEl.innerHTML = baseDesc + stockHTML;
      }

      // Carrusel
      const carouselSlide = document.getElementById("carouselSlide");
      const dotsContainer = document.getElementById("carouselDots");
      const images = Array.isArray(product.images) ? product.images : ['images/placeholder.jpg'];
      let currentIdx = 0;

      function move() {
        carouselSlide.style.transform = `translateX(-${currentIdx * 100}%)`;
        if (dotsContainer) {
          Array.from(dotsContainer.children).forEach((dot, i) => {
            dot.classList.toggle("active", i === currentIdx);
          });
        }
      }

      images.forEach((src, index) => {
        const img = document.createElement("img");
        img.src = src;
        carouselSlide.appendChild(img);

        if (dotsContainer) {
          const dot = document.createElement("span");
          dot.className = "carousel-dot" + (index === 0 ? " active" : "");
          dot.onclick = () => { currentIdx = index; move(); };
          dotsContainer.appendChild(dot);
        }
      });

      document.querySelector(".carousel-btn.prev").onclick = () => { 
        currentIdx = (currentIdx - 1 + images.length) % images.length; 
        move(); 
      };
      document.querySelector(".carousel-btn.next").onclick = () => { 
        currentIdx = (currentIdx + 1) % images.length; 
        move(); 
      };

      // Carrito
      const addBtn = document.getElementById("addToCart");
      if (addBtn) {
        addBtn.onclick = () => {
          let cart = JSON.parse(localStorage.getItem("cart")) || [];
          cart.push(product);
          localStorage.setItem("cart", JSON.stringify(cart));
          alert("¡Producto agregado!");
          document.getElementById("goToCartBtn").style.display = "block";
        };
      }
      
      const goToCart = document.getElementById("goToCartBtn");
      if (goToCart) goToCart.onclick = () => window.location.href = 'cart.html';
    }
  }

  // 5. PÁGINA DEL CARRITO (cart.html)
  const cartList = document.getElementById("cartItems");
  const totalDisplay = document.getElementById("totalPrice");
  const checkoutBtn = document.getElementById("checkoutBtn");
  
  if (cartList && totalDisplay) {
    window.cambiarCantidad = function(key, delta) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      if (delta === 1) {
        const item = cart.find(i => (i.id || i.name) === key);
        if (item) cart.push({...item});
      } else {
        const idx = cart.findLastIndex(i => (i.id || i.name) === key);
        if (idx !== -1) cart.splice(idx, 1);
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    };

    function renderCart() {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      cartList.innerHTML = "";
      let total = 0;
      const grouped = {};

      cart.forEach(item => {
        const key = item.id || item.name;
        if (!grouped[key]) grouped[key] = { ...item, qty: 0 };
        grouped[key].qty++;
      });

      const itemsSorteados = Object.values(grouped);

      // --- BLOQUEO DEL BOTÓN DE PAGO ---
      if (itemsSorteados.length === 0) {
        cartList.innerHTML = "<p style='text-align:center; padding:20px;'>El carrito está vacío.</p>";
        if (checkoutBtn) {
          checkoutBtn.onclick = (e) => {
            e.preventDefault();
            alert("Tu carrito está vacío. Agrega productos para continuar.");
          };
          checkoutBtn.style.opacity = "0.5";
        }
      } else {
        if (checkoutBtn) {
          checkoutBtn.onclick = null; // Quita el bloqueo si hay items
          checkoutBtn.style.opacity = "1";
        }
      }

      itemsSorteados.forEach(item => {
        const key = item.id || item.name;
        const subtotal = item.price * item.qty;
        total += subtotal;

        const li = document.createElement("li");
        li.className = "cart-item"; 
        li.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px; width:100%; padding:10px 0; border-bottom: 1px solid #eee;">
            <img src="${item.images[0] || 'images/placeholder.jpg'}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;">
            <div style="flex-grow:1; min-width: 0;">
              <div style="font-weight:bold; font-size:0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
              <div style="color:#666; font-size:0.8rem;">₲${formatPrice(item.price)}</div>
              
              <div style="display:flex; align-items:center; gap:12px; margin-top:5px;">
                <button onclick="cambiarCantidad('${key}', -1)" style="width:28px; height:28px; background:#e0e0e0; border:none; border-radius:4px; font-weight:bold;">-</button>
                <span style="font-weight:bold; font-size:1rem;">${item.qty}</span>
                <button onclick="cambiarCantidad('${key}', 1)" style="width:28px; height:28px; background:#e0e0e0; border:none; border-radius:4px; font-weight:bold;">+</button>
              </div>
            </div>
            <div style="font-weight:bold; color:#28a745; font-size:0.9rem; white-space: nowrap;">₲${formatPrice(subtotal)}</div>
          </div>
        `;
        cartList.appendChild(li);
      });

      totalDisplay.textContent = `Total: ₲${formatPrice(total)}`;
    }

    const clearBtn = document.getElementById("clearCart");
    if (clearBtn) clearBtn.onclick = () => { 
      if(confirm("¿Vaciar el carrito?")) {
        localStorage.removeItem("cart"); 
        renderCart(); 
      }
    };

    renderCart();
  }
});
