// payment-advanced.js - Advanced Payment System with Indian Location Selection

document.addEventListener('DOMContentLoaded', () => {
    createAdvancedPaymentModal();
    createRatingModal(); // Create rating modal on page load
});

let currentDiscount = 0;
let deliveryAddress = null;

// Indian States and Cities Database
const indianLocations = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati', 'Kakinada'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tezpur', 'Nagaon'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
    'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'],
    'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar'],
    'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Kullu', 'Solan', 'Mandi'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Giridih'],
    'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum', 'Gulbarga'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Vasind'],
    'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching'],
    'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Baghmara'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'],
    'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
    'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Mahbubnagar'],
    'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Ambassa', 'Belonia'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida', 'Ghaziabad', 'Meerut'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Rishikesh'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Darjeeling']
};

function createAdvancedPaymentModal() {
    if (document.getElementById('payment-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'payment-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2><i class='bx bx-credit-card'></i> Complete Your Payment</h2>
            
            <!-- Delivery Address Section -->
            <div class="address-section">
                <h3><i class='bx bx-map'></i> Delivery Address</h3>
                <div class="location-selects">
                    <select id="state-select" required>
                        <option value="">Select State</option>
                    </select>
                    <select id="city-select" required disabled>
                        <option value="">Select City</option>
                    </select>
                </div>
                <textarea id="full-address" class="text-field" placeholder="Enter your complete address (House No., Street, Landmark)" required rows="3"></textarea>
                <input type="text" id="pincode" class="text-field" placeholder="PIN Code" maxlength="6" pattern="[0-9]{6}" required>
            </div>
            
            <!-- Order Summary Section -->
            <div class="order-summary">
                <p><strong>Order Total:</strong> ₹<span id="order-total"></span></p>
                <input type="text" id="coupon-code" class="text-field" placeholder="Enter Promo Code (e.g., SPICE10)">
                <button class="primary-button" id="apply-coupon"><i class='bx bx-purchase-tag'></i> Apply Coupon</button>
                <p id="discount-info"></p>
            </div>

            <!-- Payment Method Section -->
            <form id="payment-form">
                <h3><i class='bx bx-wallet'></i> Payment Method</h3>
                <label><input type="radio" name="payment-method" value="upi" checked> <i class='bx bx-mobile'></i> UPI Payment</label>
                <label><input type="radio" name="payment-method" value="card"> <i class='bx bx-credit-card'></i> Credit / Debit Card</label>
                <label><input type="radio" name="payment-method" value="netbanking"> <i class='bx bx-buildings'></i> Net Banking</label>
                <label><input type="radio" name="payment-method" value="cod"> <i class='bx bx-money'></i> Cash on Delivery</label>

                <div id="payment-fields">
                    <!-- Payment fields will be injected here -->
                </div>

                <button type="submit" class="primary-button hover-icon-right">
                    <i class='bx bx-check-circle'></i> Place Order
                </button>
                <div id="payment-loader">
                    <i class='bx bx-loader-alt bx-spin'></i> Processing Payment...
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Populate states dropdown
    const stateSelect = document.getElementById('state-select');
    Object.keys(indianLocations).sort().forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });

    // Event listeners
    document.querySelector('#payment-modal .close-modal').addEventListener('click', closeAllModals);
    document.getElementById('apply-coupon').addEventListener('click', applyCoupon);
    document.getElementById('payment-form').addEventListener('submit', handleAdvancedPayment);
    document.getElementById('state-select').addEventListener('change', handleStateChange);
    
    document.getElementsByName('payment-method').forEach(input => {
        input.addEventListener('change', renderPaymentFields);
    });

    renderPaymentFields(); // Initial load
}

function handleStateChange(e) {
    const state = e.target.value;
    const citySelect = document.getElementById('city-select');
    
    // Clear and disable city select
    citySelect.innerHTML = '<option value="">Select City</option>';
    
    if (state) {
        // Enable and populate cities
        citySelect.disabled = false;
        const cities = indianLocations[state];
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    } else {
        citySelect.disabled = true;
    }
}

function renderPaymentFields() {
    const container = document.getElementById('payment-fields');
    const method = document.querySelector('input[name="payment-method"]:checked').value;

    if (method === 'upi') {
        container.innerHTML = `
            <div style="margin-top: 15px;">
                <input type="text" class="text-field" placeholder="Enter UPI ID (e.g., yourname@paytm)" pattern="[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}" required>
                <p style="font-size: 13px; color: var(--gray-color); margin-top: 8px;">
                    <i class='bx bx-info-circle'></i> Supports all UPI apps: PhonePe, Google Pay, Paytm, BHIM
                </p>
            </div>
        `;
    } else if (method === 'card') {
        container.innerHTML = `
            <div style="margin-top: 15px;">
                <input type="text" class="text-field" placeholder="Cardholder Name" required style="margin-bottom: 12px;">
                <input type="text" class="text-field" placeholder="Card Number (16 digits)" maxlength="19" pattern="[0-9 ]{16,19}" required style="margin-bottom: 12px;">
                <div class="card-inputs-grid">
                    <input type="text" class="text-field" placeholder="MM/YY" maxlength="5" pattern="[0-9]{2}/[0-9]{2}" required>
                    <input type="text" class="text-field" placeholder="CVV" maxlength="3" pattern="[0-9]{3}" required>
                </div>
            </div>
        `;
    } else if (method === 'netbanking') {
        container.innerHTML = `
            <div style="margin-top: 15px;">
                <select class="text-field" required style="margin-bottom: 12px;">
                    <option value="">Select Your Bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="pnb">Punjab National Bank</option>
                    <option value="bob">Bank of Baroda</option>
                    <option value="kotak">Kotak Mahindra Bank</option>
                    <option value="yes">Yes Bank</option>
                    <option value="idbi">IDBI Bank</option>
                    <option value="canara">Canara Bank</option>
                    <option value="union">Union Bank of India</option>
                    <option value="other">Other Banks</option>
                </select>
                <input type="text" class="text-field" placeholder="Account Number" maxlength="18" pattern="[0-9]{9,18}" required style="margin-bottom: 12px;">
                <input type="text" class="text-field" placeholder="IFSC Code (e.g., SBIN0001234)" maxlength="11" pattern="[A-Z]{4}0[A-Z0-9]{6}" required style="text-transform: uppercase;">
                <p style="font-size: 13px; color: var(--gray-color); margin-top: 8px;">
                    <i class='bx bx-info-circle'></i> You will be redirected to your bank's secure login page
                </p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div style="margin-top: 15px; padding: 15px; background: rgba(196, 30, 58, 0.05); border-radius: var(--small-radius); border-left: 4px solid var(--primary-color);">
                <p style="color: var(--secondary-color); font-weight: 500; font-size: 14px;">
                    <i class='bx bx-info-circle'></i> Please keep exact change ready for contactless delivery
                </p>
            </div>
        `;
    }
}

function applyCoupon() {
    const input = document.getElementById('coupon-code').value.trim().toUpperCase();
    const discountLabel = document.getElementById('discount-info');
    let total = getTotalPrice();

    if (input === 'SPICE10') {
        currentDiscount = Math.round(total * 0.10);
        discountLabel.textContent = `🎉 Coupon applied! You saved ₹${currentDiscount}`;
        discountLabel.style.color = '#10B981';
    } else if (input === 'FLAT50') {
        currentDiscount = 50;
        discountLabel.textContent = `🎉 Flat ₹50 discount applied!`;
        discountLabel.style.color = '#10B981';
    } else if (input === 'WELCOME15') {
        currentDiscount = Math.round(total * 0.15);
        discountLabel.textContent = `🎉 Welcome discount! You saved ₹${currentDiscount}`;
        discountLabel.style.color = '#10B981';
    } else if (input === '') {
        currentDiscount = 0;
        discountLabel.textContent = '';
    } else {
        currentDiscount = 0;
        discountLabel.textContent = `❌ Invalid or expired coupon code`;
        discountLabel.style.color = '#EF4444';
    }

    const finalAmount = total - currentDiscount;
    document.getElementById('order-total').textContent = finalAmount;
}

function handleCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'warning');
        return;
    }

    const total = getTotalPrice();
    currentDiscount = 0;
    deliveryAddress = null;
    
    document.getElementById('order-total').textContent = total;
    document.getElementById('discount-info').textContent = '';
    document.getElementById('coupon-code').value = '';
    document.getElementById('state-select').value = '';
    document.getElementById('city-select').value = '';
    document.getElementById('city-select').disabled = true;
    document.getElementById('full-address').value = '';
    document.getElementById('pincode').value = '';
    
    // Reset to UPI payment method
    const upiRadio = document.querySelector('input[name="payment-method"][value="upi"]');
    if (upiRadio) {
        upiRadio.checked = true;
        renderPaymentFields();
    }
    
    document.getElementById('payment-modal').style.display = 'flex';
}

function handleAdvancedPayment(e) {
    e.preventDefault();

    // Validate address
    const state = document.getElementById('state-select').value;
    const city = document.getElementById('city-select').value;
    const fullAddress = document.getElementById('full-address').value.trim();
    const pincode = document.getElementById('pincode').value.trim();

    if (!state || !city || !fullAddress || !pincode) {
        showToast('Please fill in complete delivery address', 'warning');
        return;
    }

    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
        showToast('Please enter a valid 6-digit PIN code', 'error');
        return;
    }

    deliveryAddress = {
        state,
        city,
        fullAddress,
        pincode
    };

    const method = document.querySelector('input[name="payment-method"]:checked').value;
    const loader = document.getElementById('payment-loader');
    loader.style.display = 'block';

    // Simulate payment processing
    setTimeout(() => {
        loader.style.display = 'none';
        const finalAmount = getTotalPrice() - currentDiscount;
        
        // Clear cart
        cart = [];
        saveCart();
        updateCartCount();
        
        closeAllModals();
        
        let paymentMethodText = '';
        if (method === 'upi') paymentMethodText = 'UPI';
        else if (method === 'card') paymentMethodText = 'Card';
        else if (method === 'netbanking') paymentMethodText = 'Net Banking';
        else paymentMethodText = 'Cash on Delivery';
        
        showToast(`${method === 'cod' ? 'Order placed successfully!' : 'Payment successful!'} 🎉`, 'success');
        
        // Show order confirmation
        showPaymentOrderConfirmation(finalAmount, paymentMethodText);
        
        // IMPORTANT: Show rating modal after 3 seconds
        setTimeout(() => {
            console.log('Opening rating modal now...');
            openRatingModal(finalAmount);
        }, 3000);
    }, 2000);
}

function getTotalPrice() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Order confirmation modal for payment
function showPaymentOrderConfirmation(totalPrice, paymentMethod) {
    if (!document.getElementById('payment-order-confirm-modal')) {
        const confirmModal = document.createElement('div');
        confirmModal.id = 'payment-order-confirm-modal';
        confirmModal.className = 'modal';
        confirmModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="order-success">
                    <i class='bx bx-check-circle'></i>
                    <h2>Order Placed Successfully!</h2>
                    <p style="color: var(--gray-color);">Thank you for choosing Spice Junction</p>
                    <div style="background: rgba(196, 30, 58, 0.05); padding: 20px; border-radius: var(--medium-radius); margin: 20px 0; border-left: 4px solid var(--primary-color);">
                        <p style="margin: 5px 0;"><strong>Order ID:</strong> <span id="payment-order-id"></span></p>
                        <p style="margin: 5px 0;"><strong>Payment Method:</strong> <span id="payment-method-text"></span></p>
                        <p class="order-total" style="margin: 10px 0; font-size: 24px;">Total: ₹<span id="payment-final-amount"></span></p>
                        <p style="margin: 5px 0;"><strong>Delivery Address:</strong></p>
                        <p id="payment-delivery-address-text" style="color: var(--gray-color); font-size: 14px;"></p>
                    </div>
                    <p class="delivery-info">🚚 Your delicious food will be delivered in <strong>30-45 minutes</strong></p>
                    <button id="payment-continue-shopping" class="primary-button hover-icon-right">
                        Continue Shopping <i class='bx bx-right-arrow-alt'></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmModal);
        
        document.querySelector('#payment-order-confirm-modal .close-modal').addEventListener('click', function() {
            document.getElementById('payment-order-confirm-modal').style.display = 'none';
        });
        document.getElementById('payment-continue-shopping').addEventListener('click', function() {
            document.getElementById('payment-order-confirm-modal').style.display = 'none';
        });
    }
    
    document.getElementById('payment-order-id').textContent = `SJ${Date.now().toString().slice(-8)}`;
    document.getElementById('payment-method-text').textContent = paymentMethod || 'N/A';
    document.getElementById('payment-final-amount').textContent = totalPrice;
    
    if (deliveryAddress) {
        document.getElementById('payment-delivery-address-text').textContent = 
            `${deliveryAddress.fullAddress}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pincode}`;
    }
    
    document.getElementById('payment-order-confirm-modal').style.display = 'flex';
}

// ======= RATING AND FEEDBACK SYSTEM =======
function createRatingModal() {
    console.log('Creating rating modal...');
    
    const ratingModal = document.createElement('div');
    ratingModal.id = 'rating-modal';
    ratingModal.className = 'modal';
    ratingModal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <span class="close-modal rating-close">&times;</span>
            <div class="rating-container">
                <h2><i class='bx bx-star'></i> Rate Your Experience</h2>
                <p style="color: var(--gray-color); margin-bottom: 20px;">How was your ordering experience?</p>
                
                <div class="star-rating">
                    <i class='bx bx-star star' data-rating="1"></i>
                    <i class='bx bx-star star' data-rating="2"></i>
                    <i class='bx bx-star star' data-rating="3"></i>
                    <i class='bx bx-star star' data-rating="4"></i>
                    <i class='bx bx-star star' data-rating="5"></i>
                </div>
                <p id="rating-text" style="color: var(--primary-color); font-weight: 600; margin-top: 10px; min-height: 24px;"></p>
                
                <form id="feedback-form" style="margin-top: 25px;">
                    <textarea id="feedback-text" class="text-field" placeholder="Tell us more about your experience (optional)" rows="4"></textarea>
                    
                    <div style="margin-top: 15px;">
                        <p style="font-weight: 600; margin-bottom: 10px; color: var(--secondary-color);">Quick Suggestions:</p>
                        <div class="suggestion-chips">
                            <button type="button" class="suggestion-chip">Great Food</button>
                            <button type="button" class="suggestion-chip">Fast Delivery</button>
                            <button type="button" class="suggestion-chip">Good Packaging</button>
                            <button type="button" class="suggestion-chip">Tasty & Fresh</button>
                            <button type="button" class="suggestion-chip">Value for Money</button>
                            <button type="button" class="suggestion-chip">Excellent Service</button>
                        </div>
                    </div>
                    
                    <button type="submit" class="primary-button hover-icon-right" style="width: 100%; margin-top: 20px;">
                        Submit Feedback <i class='bx bx-send'></i>
                    </button>
                    <button type="button" id="skip-feedback" style="width: 100%; margin-top: 10px; background: none; border: none; color: var(--gray-color); cursor: pointer; padding: 10px;">
                        Skip for now
                    </button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(ratingModal);
    console.log('Rating modal HTML added to body');
    
    // Setup rating functionality
    setupRatingFunctionality();
}

function setupRatingFunctionality() {
    let selectedRating = 0;
    let selectedSuggestions = [];
    
    const stars = document.querySelectorAll('#rating-modal .star');
    const ratingText = document.getElementById('rating-text');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-rating'));
            updateStars(selectedRating);
            updateRatingText(selectedRating);
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            updateStars(rating);
        });
    });
    
    document.querySelector('#rating-modal .star-rating').addEventListener('mouseleave', function() {
        updateStars(selectedRating);
    });
    
    function updateStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('bx-star');
                star.classList.add('bxs-star');
            } else {
                star.classList.remove('bxs-star');
                star.classList.add('bx-star');
            }
        });
    }
    
    function updateRatingText(rating) {
        const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
        ratingText.textContent = texts[rating] || '';
    }
    
    // Suggestion chips
    document.querySelectorAll('#rating-modal .suggestion-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            this.classList.toggle('active');
            const text = this.textContent;
            
            if (this.classList.contains('active')) {
                selectedSuggestions.push(text);
            } else {
                selectedSuggestions = selectedSuggestions.filter(s => s !== text);
            }
        });
    });
    
    // Form submission
    document.getElementById('feedback-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (selectedRating === 0) {
            showToast('Please select a rating', 'warning');
            return;
        }
        
        const feedbackText = document.getElementById('feedback-text').value.trim();
        const feedback = {
            rating: selectedRating,
            comment: feedbackText,
            suggestions: selectedSuggestions,
            date: new Date().toISOString()
        };
        
        console.log('Feedback submitted:', feedback);
        
        document.getElementById('rating-modal').style.display = 'none';
        showToast('Thank you for your valuable feedback! 🙏', 'success');
        
        // Reset form
        selectedRating = 0;
        selectedSuggestions = [];
        updateStars(0);
        ratingText.textContent = '';
        document.getElementById('feedback-text').value = '';
        document.querySelectorAll('#rating-modal .suggestion-chip').forEach(chip => {
            chip.classList.remove('active');
        });
    });
    
    // Skip button
    document.getElementById('skip-feedback').addEventListener('click', function() {
        document.getElementById('rating-modal').style.display = 'none';
        showToast('You can rate us anytime!', 'info');
    });
    
    // Close button
    document.querySelector('#rating-modal .rating-close').addEventListener('click', function() {
        document.getElementById('rating-modal').style.display = 'none';
    });
}

function openRatingModal(orderAmount) {
    console.log('openRatingModal called with amount:', orderAmount);
    const modal = document.getElementById('rating-modal');
    
    if (!modal) {
        console.error('Rating modal not found!');
        return;
    }
    
    // Reset form
    document.querySelectorAll('#rating-modal .star').forEach(star => {
        star.classList.remove('bxs-star');
        star.classList.add('bx-star');
    });
    document.getElementById('rating-text').textContent = '';
    document.getElementById('feedback-text').value = '';
    document.querySelectorAll('#rating-modal .suggestion-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    
    modal.style.display = 'flex';
    console.log('Rating modal displayed!');
}