// app.js - Main JavaScript for Spice Junction
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initializeAuth();
    initializeCart();
    
    // Initialize tooltips and other visual elements
    updateUI();
});

// Global User State
let currentUser = null;
let isLoggedIn = false;
let cart = [];
let wishlist = [];

// ======= USER AUTHENTICATION FUNCTIONS =======
function initializeAuth() {
    // Check if user is already logged in (from memory)
    loadUserState();
    
    // Setup auth-related event listeners
    setupAuthListeners();
    
    // Update auth-related UI elements
    updateAuthUI();
}

function loadUserState() {
    // Load session data from sessionStorage
    const savedSession = sessionStorage.getItem('spiceJunctionSession');
    if (savedSession) {
        try {
            sessionData = JSON.parse(savedSession);
            usersDatabase = sessionData.users || [];
            
            if (sessionData.currentUser) {
                currentUser = sessionData.currentUser;
                isLoggedIn = true;
                console.log('User session restored:', currentUser.name);
            }
        } catch (e) {
            console.error('Error loading session:', e);
        }
    }
}

function setupAuthListeners() {
    // Add login/signup links to the nav
    const nav = document.querySelector('.nav');
    
    // Create login/register container
    const authContainer = document.createElement('div');
    authContainer.className = 'auth-container';
    
    // Add login/logout buttons
    if (!isLoggedIn) {
        authContainer.innerHTML = `
            <a href="#" id="login-btn"><i class='bx bx-log-in'></i> Login</a>
            <a href="#" id="signup-btn"><i class='bx bx-user-plus'></i> Sign Up</a>
        `;
    } else {
        authContainer.innerHTML = `
            <a href="#wishlist" id="wishlist-link"><i class='bx bx-heart'></i> Wishlist</a>
            <span id="welcome-user"><i class='bx bx-user-circle'></i> Hi, ${currentUser.name}</span>
            <a href="#" id="logout-btn"><i class='bx bx-log-out'></i> Logout</a>
        `;
    }
    
    nav.appendChild(authContainer);
    
    // Add event listeners for auth buttons
    document.getElementById('login-btn')?.addEventListener('click', showLoginModal);
    document.getElementById('signup-btn')?.addEventListener('click', showSignupModal);
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('wishlist-link')?.addEventListener('click', showWishlistPage);
    
    // Initialize modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
}

function showLoginModal(e) {
    e.preventDefault();
    
    // Create login modal if it doesn't exist
    if (!document.getElementById('login-modal')) {
        const loginModal = document.createElement('div');
        loginModal.id = 'login-modal';
        loginModal.className = 'modal';
        loginModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2><i class='bx bx-log-in'></i> Login</h2>
                <form id="login-form">
                    <input type="email" class="text-field" placeholder="Email Address" id="login-email" required>
                    <input type="password" class="text-field" placeholder="Password" id="login-password" required>
                    <button type="submit" class="primary-button hover-icon-right">Login <i class='bx bx-right-arrow-alt'></i></button>
                </form>
                <p class="form-footer">Don't have an account? <a href="#" id="switch-to-signup">Sign up here</a></p>
            </div>
        `;
        document.body.appendChild(loginModal);
        
        // Add event listeners
        document.getElementById('login-form').addEventListener('submit', handleLogin);
        document.getElementById('switch-to-signup').addEventListener('click', function(e) {
            e.preventDefault();
            closeAllModals();
            showSignupModal(e);
        });
        document.querySelector('#login-modal .close-modal').addEventListener('click', closeAllModals);
    }
    
    // Show the modal
    document.getElementById('login-modal').style.display = 'flex';
}

function showSignupModal(e) {
    e.preventDefault();
    
    // Create signup modal if it doesn't exist
    if (!document.getElementById('signup-modal')) {
        const signupModal = document.createElement('div');
        signupModal.id = 'signup-modal';
        signupModal.className = 'modal';
        signupModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2><i class='bx bx-user-plus'></i> Sign Up</h2>
                <form id="signup-form">
                    <input type="text" class="text-field" placeholder="Full Name" id="signup-name" required>
                    <input type="email" class="text-field" placeholder="Email Address" id="signup-email" required>
                    <input type="password" class="text-field" placeholder="Create Password" id="signup-password" required>
                    <button type="submit" class="primary-button hover-icon-right">Create Account <i class='bx bx-right-arrow-alt'></i></button>
                </form>
                <p class="form-footer">Already have an account? <a href="#" id="switch-to-login">Login here</a></p>
            </div>
        `;
        document.body.appendChild(signupModal);
        
        // Add event listeners
        document.getElementById('signup-form').addEventListener('submit', handleSignup);
        document.getElementById('switch-to-login').addEventListener('click', function(e) {
            e.preventDefault();
            closeAllModals();
            showLoginModal(e);
        });
        document.querySelector('#signup-modal .close-modal').addEventListener('click', closeAllModals);
    }
    
    // Show the modal
    document.getElementById('signup-modal').style.display = 'flex';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// In-memory user storage
let usersDatabase = [];

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Check in-memory database
    const user = usersDatabase.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Login successful
        currentUser = {
            id: user.id,
            name: user.name,
            email: user.email
        };
        
        isLoggedIn = true;
        
        // Save session
        saveSession();
        
        // Load user's cart if available
        loadUserCart();
        loadWishlist();
        
        // Update UI
        updateAuthUI();
        showToast('Welcome back to Spice Junction! 🎉', 'success');
        closeAllModals();
        
        // Reload buttons to update wishlist state
        addCartButtons();
    } else {
        // Login failed
        showToast('Invalid email or password', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    // Check if user already exists
    if (usersDatabase.some(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        cart: []
    };
    
    // Add to users database
    usersDatabase.push(newUser);
    
    // Auto login after signup
    currentUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
    };
    
    isLoggedIn = true;
    cart = [];
    
    // Save session
    saveSession();
    
    // Update UI
    updateAuthUI();
    showToast('Welcome to Spice Junction! 🎉', 'success');
    closeAllModals();
    
    // Reload buttons to update wishlist state
    addCartButtons();
}

function logout() {
    // Clear user data
    currentUser = null;
    isLoggedIn = false;
    cart = [];
    wishlist = [];
    
    // Clear session
    sessionStorage.removeItem('spiceJunctionSession');
    sessionData = { users: usersDatabase, currentUser: null };
    
    // Update UI
    updateAuthUI();
    showToast('Thank you for visiting Spice Junction!', 'info');
    
    // Reload the page to reset all states
    location.reload();
}

function updateAuthUI() {
    // Replace auth buttons based on login state
    const authContainer = document.querySelector('.auth-container');
    
    if (authContainer) {
        if (isLoggedIn) {
            authContainer.innerHTML = `
                <a href="#wishlist" id="wishlist-link"><i class='bx bx-heart'></i> Wishlist</a>
                <span id="welcome-user"><i class='bx bx-user-circle'></i> Hi, ${currentUser.name}</span>
                <a href="#" id="logout-btn"><i class='bx bx-log-out'></i> Logout</a>
            `;
            document.getElementById('logout-btn').addEventListener('click', logout);
            document.getElementById('wishlist-link').addEventListener('click', showWishlistPage);
        } else {
            authContainer.innerHTML = `
                <a href="#" id="login-btn"><i class='bx bx-log-in'></i> Login</a>
                <a href="#" id="signup-btn"><i class='bx bx-user-plus'></i> Sign Up</a>
            `;
            document.getElementById('login-btn').addEventListener('click', showLoginModal);
            document.getElementById('signup-btn').addEventListener('click', showSignupModal);
        }
    }
    
    // Update cart button visibility
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.style.display = isLoggedIn ? 'flex' : 'none';
    }
}

// ======= SHOPPING CART FUNCTIONS =======
function initializeCart() {
    // Add cart button to header
    const header = document.querySelector('.header');
    
    const cartButton = document.createElement('div');
    cartButton.id = 'cart-btn';
    cartButton.className = 'cart-button';
    cartButton.innerHTML = `
        <i class='bx bx-cart'></i>
        <span class="cart-count">0</span>
    `;
    
    // Insert before the nav
    header.appendChild(cartButton);
    
    // Load cart data if user is logged in
    if (isLoggedIn) {
        loadUserCart();
    }
    
    // Create cart modal
    const cartModal = document.createElement('div');
    cartModal.id = 'cart-modal';
    cartModal.className = 'modal';
    cartModal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2><i class='bx bx-shopping-bag'></i> Your Cart</h2>
            <div class="cart-items">
                <!-- Cart items will be added here dynamically -->
            </div>
            <div class="cart-summary">
                <div class="cart-total">
                    <span>Total Amount:</span>
                    <span class="total-price">₹0</span>
                </div>
                <button id="checkout-btn" class="primary-button hover-icon-right">
                    Proceed to Checkout <i class='bx bx-right-arrow-alt'></i>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(cartModal);
    
    // Add event listeners
    document.getElementById('cart-btn').addEventListener('click', showCart);
    document.querySelector('#cart-modal .close-modal').addEventListener('click', closeAllModals);
    
    // Add "Add to Cart" buttons to menu items
    addCartButtons();
}

function loadUserCart() {
    if (!currentUser) return;
    
    // Load cart from user data in memory
    const user = usersDatabase.find(u => u.id === currentUser.id);
    if (user && user.cart) {
        cart = user.cart;
        updateCartCount();
    }
}

function addCartButtons() {
    // Add "Add to Cart" and "Wishlist" buttons to each menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        const itemName = item.querySelector('h3').textContent;
        const itemPrice = item.querySelector('.menu-item-price').textContent;
        const itemImg = item.querySelector('img').getAttribute('src');
        
        // Check if buttons already exist
        if (!item.querySelector('.add-to-cart-btn')) {
            // Create button container
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '10px';
            buttonContainer.style.marginTop = '15px';
            
            // Add to Cart button
            const addButton = document.createElement('button');
            addButton.className = 'primary-button add-to-cart-btn';
            addButton.style.flex = '1';
            addButton.innerHTML = '<i class="bx bx-cart-add"></i> Add to Cart';
            
            addButton.addEventListener('click', function() {
                addToCart(itemName, itemPrice, itemImg);
            });
            
            // Wishlist button
            const wishlistButton = document.createElement('button');
            wishlistButton.className = 'wishlist-btn';
            wishlistButton.innerHTML = '<i class="bx bx-heart"></i>';
            wishlistButton.title = 'Add to Wishlist';
            
            // Check if item is in wishlist
            const isInWishlist = wishlist.some(w => w.name === itemName);
            if (isInWishlist) {
                wishlistButton.classList.add('active');
                wishlistButton.innerHTML = '<i class="bx bxs-heart"></i>';
            }
            
            wishlistButton.addEventListener('click', function() {
                toggleWishlist(itemName, itemPrice, itemImg, wishlistButton);
            });
            
            buttonContainer.appendChild(addButton);
            buttonContainer.appendChild(wishlistButton);
            item.appendChild(buttonContainer);
        }
    });
}

function addToCart(name, price, image) {
    if (!isLoggedIn) {
        showToast('Please login to add items to cart', 'warning');
        showLoginModal(new Event('click'));
        return;
    }
    
    // Parse price (remove ₹ symbol)
    const priceValue = parseInt(price.replace('₹', ''));
    
    // Check if item already in cart
    const existingItemIndex = cart.findIndex(item => item.name === name);
    
    if (existingItemIndex !== -1) {
        // Increment quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item
        cart.push({
            name,
            price: priceValue,
            image,
            quantity: 1
        });
    }
    
    // Save to user's cart in memory
    saveCart();
    
    // Update UI
    updateCartCount();
    showToast(`${name} added to cart! 🛒`, 'success');
}

function removeFromCart(index) {
    const itemName = cart[index].name;
    
    // Remove item from cart
    cart.splice(index, 1);
    
    // Save to memory
    saveCart();
    
    // Update UI
    updateCartCount();
    renderCartItems();
    showToast(`${itemName} removed from cart`, 'info');
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function saveCart() {
    if (!currentUser) return;
    
    // Save cart to user data in memory
    const user = usersDatabase.find(u => u.id === currentUser.id);
    if (user) {
        user.cart = cart;
    }
}

function showCart() {
    if (!isLoggedIn) {
        showToast('Please login to view your cart', 'warning');
        showLoginModal(new Event('click'));
        return;
    }
    
    // Render cart items
    renderCartItems();
    
    // Show the modal
    document.getElementById('cart-modal').style.display = 'flex';
}

function renderCartItems() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalPriceElement = document.querySelector('.total-price');
    
    // Clear current items
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart"><i class="bx bx-shopping-bag"></i><br>Your cart is empty<br>Add some delicious items!</p>';
        totalPriceElement.textContent = '₹0';
        return;
    }
    
    // Add each item
    let totalPrice = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>₹${item.price}</p>
                <div class="quantity-control">
                    <button class="quantity-btn minus" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" data-index="${index}">+</button>
                </div>
            </div>
            <div class="cart-item-price">
                <p>₹${itemTotal}</p>
                <button class="remove-item" data-index="${index}">
                    <i class='bx bx-trash'></i>
                </button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Update total
    totalPriceElement.textContent = `₹${totalPrice}`;
    
    // Add event listeners for quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            
            if (this.classList.contains('minus')) {
                decreaseQuantity(index);
            } else if (this.classList.contains('plus')) {
                increaseQuantity(index);
            }
        });
    });
    
    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFromCart(index);
        });
    });
    
    // Re-attach checkout button listener
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        // Remove old listener by cloning the button
        const newCheckoutBtn = checkoutBtn.cloneNode(true);
        checkoutBtn.parentNode.replaceChild(newCheckoutBtn, checkoutBtn);
        
        // Add new listener
        newCheckoutBtn.addEventListener('click', function() {
            if (typeof handleCheckout === 'function') {
                handleCheckout();
            } else {
                console.error('handleCheckout function not found');
            }
        });
    }
}

function increaseQuantity(index) {
    cart[index].quantity += 1;
    saveCart();
    renderCartItems();
    updateCartCount();
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        saveCart();
        renderCartItems();
        updateCartCount();
    } else {
        removeFromCart(index);
    }
}

function showOrderConfirmation(totalPrice, paymentMethod) {
    // Create confirmation modal if it doesn't exist
    if (!document.getElementById('order-confirm-modal')) {
        const confirmModal = document.createElement('div');
        confirmModal.id = 'order-confirm-modal';
        confirmModal.className = 'modal';
        confirmModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="order-success">
                    <i class='bx bx-check-circle'></i>
                    <h2>Order Placed Successfully!</h2>
                    <p style="color: var(--gray-color);">Thank you for choosing Spice Junction</p>
                    <div style="background: rgba(196, 30, 58, 0.05); padding: 20px; border-radius: var(--medium-radius); margin: 20px 0; border-left: 4px solid var(--primary-color);">
                        <p style="margin: 5px 0;"><strong>Order ID:</strong> <span id="order-id"></span></p>
                        <p style="margin: 5px 0;"><strong>Payment Method:</strong> <span id="payment-method-text"></span></p>
                        <p class="order-total" style="margin: 10px 0; font-size: 24px;">Total: ₹<span id="final-amount"></span></p>
                        <p style="margin: 5px 0;"><strong>Delivery Address:</strong></p>
                        <p id="delivery-address-text" style="color: var(--gray-color); font-size: 14px;"></p>
                    </div>
                    <p class="delivery-info">🚚 Your delicious food will be delivered in <strong>30-45 minutes</strong></p>
                    <button id="continue-shopping" class="primary-button hover-icon-right">
                        Continue Shopping <i class='bx bx-right-arrow-alt'></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmModal);
        
        document.querySelector('#order-confirm-modal .close-modal').addEventListener('click', closeAllModals);
        document.getElementById('continue-shopping').addEventListener('click', closeAllModals);
    }
    
    // Update order details
    document.getElementById('order-id').textContent = `SJ${Date.now().toString().slice(-8)}`;
    document.getElementById('payment-method-text').textContent = paymentMethod || 'N/A';
    document.getElementById('final-amount').textContent = totalPrice;
    
    // Show the modal
    document.getElementById('order-confirm-modal').style.display = 'flex';
}

// ======= UI HELPER FUNCTIONS =======
function updateUI() {
    // Add toast container if it doesn't exist
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Set icon based on type
    let icon = 'bx-info-circle';
    if (type === 'success') icon = 'bx-check-circle';
    if (type === 'error') icon = 'bx-error-circle';
    if (type === 'warning') icon = 'bx-error';
    
    toast.innerHTML = `
        <i class='bx ${icon}'></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Show with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3000);
}

// Helper function to get total cart price
function getTotalPrice() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// ======= WISHLIST FUNCTIONS =======
function toggleWishlist(name, price, image, button) {
    if (!isLoggedIn) {
        showToast('Please login to manage wishlist', 'warning');
        showLoginModal(new Event('click'));
        return;
    }
    
    const priceValue = parseInt(price.replace('₹', ''));
    const existingIndex = wishlist.findIndex(item => item.name === name);
    
    if (existingIndex !== -1) {
        // Remove from wishlist
        wishlist.splice(existingIndex, 1);
        button.classList.remove('active');
        button.innerHTML = '<i class="bx bx-heart"></i>';
        showToast(`${name} removed from wishlist`, 'info');
    } else {
        // Add to wishlist
        wishlist.push({ name, price: priceValue, image });
        button.classList.add('active');
        button.innerHTML = '<i class="bx bxs-heart"></i>';
        showToast(`${name} added to wishlist! ❤️`, 'success');
    }
    
    saveWishlist();
}

function saveWishlist() {
    if (!currentUser) return;
    const user = usersDatabase.find(u => u.id === currentUser.id);
    if (user) {
        user.wishlist = wishlist;
    }
}

function loadWishlist() {
    if (!currentUser) return;
    const user = usersDatabase.find(u => u.id === currentUser.id);
    if (user && user.wishlist) {
        wishlist = user.wishlist;
    }
}

// Session management
function saveSession() {
    sessionData = {
        users: usersDatabase,
        currentUser: currentUser
    };
    sessionStorage.setItem('spiceJunctionSession', JSON.stringify(sessionData));
}

// ======= WISHLIST PAGE =======
function showWishlistPage(e) {
    e.preventDefault();
    
    if (!isLoggedIn) {
        showToast('Please login to view wishlist', 'warning');
        showLoginModal(new Event('click'));
        return;
    }
    
    // Create wishlist modal if it doesn't exist
    if (!document.getElementById('wishlist-modal')) {
        const wishlistModal = document.createElement('div');
        wishlistModal.id = 'wishlist-modal';
        wishlistModal.className = 'modal';
        wishlistModal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <span class="close-modal">&times;</span>
                <h2><i class='bx bx-heart'></i> My Wishlist</h2>
                <div id="wishlist-items-container">
                    <!-- Wishlist items will be added here -->
                </div>
            </div>
        `;
        document.body.appendChild(wishlistModal);
        
        document.querySelector('#wishlist-modal .close-modal').addEventListener('click', closeAllModals);
    }
    
    // Render wishlist items
    renderWishlistItems();
    
    // Show modal
    document.getElementById('wishlist-modal').style.display = 'flex';
}

function renderWishlistItems() {
    const container = document.getElementById('wishlist-items-container');
    
    if (wishlist.length === 0) {
        container.innerHTML = `
            <div class="empty-wishlist">
                <i class='bx bx-heart-circle' style="font-size: 80px; color: var(--gray-color);"></i>
                <p style="margin-top: 20px; color: var(--gray-color); font-size: 18px;">Your wishlist is empty</p>
                <p style="color: var(--gray-color);">Add items you love to your wishlist!</p>
                <button class="primary-button" onclick="closeAllModals()" style="margin-top: 20px;">
                    <i class='bx bx-shopping-bag'></i> Browse Menu
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="wishlist-grid">
            ${wishlist.map((item, index) => `
                <div class="wishlist-item-card">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="wishlist-item-info">
                        <h3>${item.name}</h3>
                        <p class="wishlist-price">₹${item.price}</p>
                        <div class="wishlist-actions">
                            <button class="primary-button" onclick="addToCartFromWishlist(${index})">
                                <i class='bx bx-cart-add'></i> Add to Cart
                            </button>
                            <button class="wishlist-remove-btn" onclick="removeFromWishlistByIndex(${index})">
                                <i class='bx bx-trash'></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function addToCartFromWishlist(index) {
    const item = wishlist[index];
    addToCart(item.name, `₹${item.price}`, item.image);
}

function removeFromWishlistByIndex(index) {
    const itemName = wishlist[index].name;
    wishlist.splice(index, 1);
    saveWishlist();
    renderWishlistItems();
    
    // Update heart button on menu item
    addCartButtons();
    
    showToast(`${itemName} removed from wishlist`, 'info');
}