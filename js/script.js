// Secicileri tanimliyoruz
const searchForm = document.querySelector(".search-form");
const cartItem = document.querySelector(".cart-items-container");
const navbar = document.querySelector(".navbar");

const searchBtn = document.querySelector("#search-btn");
const cartBtn = document.querySelector("#cart-btn");
const menuBtn = document.querySelector("#menu-btn");

// Masa seçicisi
const tableSelect = document.querySelector("#table-no");

// Panel Acma / Kapama Islemleri
if (searchBtn) {
    searchBtn.addEventListener("click", function (e) {
        searchForm.classList.toggle("active");
        cartItem.classList.remove("active");
        navbar.classList.remove("active");
        e.stopPropagation();
    });
}

if (cartBtn) {
    cartBtn.addEventListener("click", function (e) {
        cartItem.classList.toggle("active");
        searchForm.classList.remove("active");
        navbar.classList.remove("active");
        e.stopPropagation();
    });
}

if (menuBtn) {
    menuBtn.addEventListener("click", function (e) {
        navbar.classList.toggle("active");
        searchForm.classList.remove("active");
        cartItem.classList.remove("active");
        e.stopPropagation();
    });
}

// Sayfaya tiklandiginda panelleri kapatma
document.addEventListener("click", function (e) {
    if (searchForm && !e.composedPath().includes(searchForm) && !e.composedPath().includes(searchBtn)) {
        searchForm.classList.remove("active");
    }
    if (cartItem && !e.composedPath().includes(cartItem) && !e.composedPath().includes(cartBtn)) {
        cartItem.classList.remove("active");
    }
    if (navbar && !e.composedPath().includes(navbar) && !e.composedPath().includes(menuBtn)) {
        navbar.classList.remove("active");
    }
});

// --- DINAMIK MASA YÜKLEME SİSTEMİ ---

function masaListesiniYukle() {
    const tSelect = document.querySelector("#table-no");
    if (!tSelect) return; 

    const masalar = JSON.parse(localStorage.getItem("kafe_masalari")) || [];
    tSelect.innerHTML = '<option value="default" disabled selected>Masa Seçin...</option>';

    masalar.forEach(masa => {
        const option = document.createElement("option");
        option.value = masa;
        option.textContent = masa;
        tSelect.appendChild(option);
    });
}

// --- GARSON PANELİNDEN GELEN MASAYI YAKALAMA ---

function checkURLForTable() {
    const urlParams = new URLSearchParams(window.location.search);
    const tableFromURL = urlParams.get('masa');

    if (tableFromURL) {
        const tSelect = document.querySelector("#table-no");
        if (tSelect) {
            setTimeout(() => {
                tSelect.value = tableFromURL;
                tSelect.style.border = "2px solid #ff4d4d";
                tSelect.style.backgroundColor = "#fff5f5";
            }, 300);
        }
    }
}

// --- DINAMIK ÜRÜN YÜKLEME SİSTEMİ ---

function renderProducts() {
    const managedProducts = JSON.parse(localStorage.getItem("yonetilen_urunler")) || [];
    
    const containers = {
        "menu": document.getElementById("menu-container"),
        "featured": document.getElementById("featured-container"),
        "desserts": document.getElementById("desserts-container"),
        "hot-drinks": document.getElementById("hot-drinks-container"),
        "cold-drinks": document.getElementById("cold-drinks-container")
    };

    if (!containers.menu && !containers.desserts && !containers.featured) return;

    Object.values(containers).forEach(container => {
        if(container) container.innerHTML = "";
    });

    managedProducts.forEach(product => {
        const targetContainer = containers[product.kategori];
        if (targetContainer) {
            let html = "";
            
            if (product.kategori === "menu") {
                html = `
                <div class="box">
                    <div class="box-head">
                        <img src="${product.resim}" alt="menu">
                        <span class="menu-category">YENİ</span>
                        <h3>${product.ad}</h3>
                        <div class="price">${product.fiyat} TL</div>
                    </div>
                    <div class="box-bottom">
                        <a href="#" class="btn add-to-cart-btn"> Sepete Ekle</a>
                    </div>
                </div>`;
            } else {
                html = `
                <div class="box">
                    <div class="box-head">
                        <span class="title">${product.kategori.toUpperCase()}</span>
                        <a href="#" class="name">${product.ad}</a>
                    </div>
                    <div class="image">
                        <img src="${product.resim}" alt=""/>
                    </div>
                    <div class="box-bottom">
                        <div class="info">
                            <b class="price">${product.fiyat} TL</b>
                            <span class="amount">Taze Hazırlanmış</span>
                        </div>
                        <div class="product-btn">
                            <a href="#" class="add-to-cart-btn"><i class="fas fa-plus"></i></a>
                        </div>
                    </div>
                </div>`;
            }
            targetContainer.insertAdjacentHTML("beforeend", html);
        }
    });

    attachCartEvents();
}

// --- DINAMIK SEPET SISTEMI ---

let cart = []; 

function attachCartEvents() {
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
    addToCartButtons.forEach((btn) => {
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation(); 

            const productBox = btn.closest(".box");
            
            let name = "";
            const h3Name = productBox.querySelector("h3");
            const aName = productBox.querySelector(".name");
            
            if (h3Name) name = h3Name.innerText;
            else if (aName) name = aName.innerText;

            const priceElement = productBox.querySelector(".price");
            if (!priceElement) return;

            const priceStr = priceElement.innerText;
            const price = parseFloat(priceStr.replace(/[^\d.]/g, "")); 
            const img = productBox.querySelector("img") ? productBox.querySelector("img").src : "";

            const product = { name, price, img, quantity: 1 };
            addToCart(product);
        };
    });
}

function addToCart(product) {
    const existing = cart.find(item => item.name === product.name);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push(product);
    }
    updateCartUI();
    if (cartItem) {
        cartItem.classList.add("active");
    }
}

function updateCartUI() {
    if (!cartItem) return;
    const currentItems = cartItem.querySelectorAll(".cart-item");
    currentItems.forEach(item => item.remove());
    const checkoutBtn = document.querySelector(".checkout-btn");

    cart.forEach((item, index) => {
        const itemHTML = `
            <div class="cart-item">
                <i class="fas fa-times" onclick="removeFromCart(${index})"></i>
                <img src="${item.img}" alt="menu" />
                <div class="content">
                    <h3>${item.name} (x${item.quantity})</h3>
                    <div class="price">${(item.price * item.quantity).toFixed(2)} TL</div>
                </div>
            </div>
        `;
        if (checkoutBtn) checkoutBtn.insertAdjacentHTML("beforebegin", itemHTML);
    });

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (cart.length === 0) {
        if (checkoutBtn) checkoutBtn.innerText = "Sepetiniz Boş";
    } else {
        const totalText = "Siparişi Onayla (" + total.toFixed(2) + " TL)";
        if (checkoutBtn) checkoutBtn.innerText = totalText;
    }
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// --- SIPARIS GONDERME (GARSON ICIN ONAY BEKLETMEYEN SISTEM) ---

const handleCheckout = (e) => {
    e.preventDefault();
    const tSelect = document.querySelector("#table-no");
    const tableNo = tSelect ? tSelect.value : null;

    if (tableNo === "default" || !tableNo) {
        alert("Lütfen Siparişten Önce Masanızı Seçiniz!");
        return;
    }

    if (cart.length === 0) {
        alert("Sepetiniz Henüz Boş!");
        return;
    }

    let existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    const existingOrderIndex = existingOrders.findIndex(o => o.table.trim() === tableNo.trim());

    // YENİ: Eğer URL'de masa varsa, garson işlem yapıyordur. Durumu direkt 'onaylandi' yap.
    const urlParams = new URLSearchParams(window.location.search);
    const isWaiter = urlParams.get('masa');
    const finalStatus = isWaiter ? "onaylandi" : "bekliyor";

    if (existingOrderIndex !== -1) {
        cart.forEach(newProduct => {
            const itemInOrder = existingOrders[existingOrderIndex].items.find(i => i.name === newProduct.name);
            if (itemInOrder) {
                itemInOrder.quantity += newProduct.quantity;
            } else {
                existingOrders[existingOrderIndex].items.push(newProduct);
            }
        });
        existingOrders[existingOrderIndex].total = existingOrders[existingOrderIndex].items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        existingOrders[existingOrderIndex].status = finalStatus;
        existingOrders[existingOrderIndex].time = new Date().toLocaleTimeString();
    } else {
        const order = {
            id: Date.now(),
            table: tableNo, 
            items: [...cart], 
            time: new Date().toLocaleTimeString(),
            startTime: Date.now(),
            total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
            status: finalStatus
        };
        existingOrders.push(order);
    }

    localStorage.setItem("orders", JSON.stringify(existingOrders));
    
    alert("Teşekkürler! " + tableNo + " siparişi sisteme kaydedildi.");
    
    // Garsonu otomatik olarak masa listesine geri gönder
    if (isWaiter) {
        window.location.href = "masalar.html";
    } else {
        cart = [];
        updateCartUI();
        if (cartItem) cartItem.classList.remove("active");
        if (tSelect) tSelect.value = "default";
    }
};

const mainCheckoutBtn = document.querySelector(".checkout-btn");
if (mainCheckoutBtn) mainCheckoutBtn.addEventListener("click", handleCheckout);

// SAYFA YÜKLENDİĞİNDE ÇALIŞTIR
document.addEventListener("DOMContentLoaded", () => {
    renderProducts(); 
    masaListesiniYukle(); 
    attachCartEvents();
    checkURLForTable(); 
});
