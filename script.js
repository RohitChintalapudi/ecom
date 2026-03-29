// ======================== CAR DATA ========================
const carsData = [
  {
    id: 1,
    name: "Mercedes-Benz AMG GT",
    pricePerDay: 29999,
    fuel: "Petrol",
    seats: 2,
    image: "./assets/img1.jpg",
  },
  {
    id: 2,
    name: "Mercedes-Benz AMG GT Yellow",
    pricePerDay: 27999,
    fuel: "Petrol",
    seats: 2,
    image: "./assets/img2.jpg",
  },
  {
    id: 3,
    name: "Mercedes-Benz AMG GT Red",
    pricePerDay: 24999,
    fuel: "Petrol",
    seats: 2,
    image: "./assets/img3.jpg",
  },
  {
    id: 4,
    name: "Chevrolet Camaro",
    pricePerDay: 21999,
    fuel: "Petrol",
    seats: 4,
    image: "./assets/img6.jpg",
  },
  {
    id: 5,
    name: "Audi RS7",
    pricePerDay: 28999,
    fuel: "Petrol",
    seats: 5,
    image: "./assets/img7.jpg",
  },
  {
    id: 6,
    name: "Ford Mustang",
    pricePerDay: 39999,
    fuel: "Petrol",
    seats: 4,
    image: "./assets/img4.jpg",
  },
  {
    id: 7,
    name: "Lamborghini Aventador",
    pricePerDay: 39999,
    fuel: "Petrol",
    seats: 2,
    image: "./assets/img5.jpg",
  },
];

// ======================== GLOBAL STATE ========================
let currentUser = null;

// ======================== UTILITIES ========================
function saveUsersToLocal(users) {
  localStorage.setItem("carRentalUsers", JSON.stringify(users));
}

function getUsers() {
  return JSON.parse(localStorage.getItem("carRentalUsers")) || [];
}

function saveCurrentSession(user) {
  localStorage.setItem("currentRentalUser", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("currentRentalUser");
}

function loadSession() {
  const stored = localStorage.getItem("currentRentalUser");
  if (stored) {
    currentUser = JSON.parse(stored);
    updateUIForLoggedInUser();
  }
}

// ======================== RENDER CAR LISTINGS ========================
function renderCars() {
  const grid = document.getElementById("carsGrid");
  const carSelect = document.getElementById("bookingCar");
  if (!grid) return;

  grid.innerHTML = "";
  carSelect.innerHTML = '<option value="">-- Choose a car --</option>';

  carsData.forEach((car) => {
    // Car card
    const card = document.createElement("div");
    card.className = "car-card";
    card.innerHTML = `
      <img src="${car.image}" alt="${car.name}">
      <div class="car-info">
        <h3>${car.name}</h3>
        <div class="car-details">
          <span><i class="fas fa-gas-pump"></i> ${car.fuel}</span>
          <span><i class="fas fa-users"></i> ${car.seats} Seats</span>
        </div>
        <div class="price">₹${car.pricePerDay}<span style="font-size:1rem;"> / day</span></div>
        <button class="rent-btn" data-car-id="${car.id}">Rent Now</button>
      </div>
    `;
    grid.appendChild(card);

    // Populate select dropdown
    const option = document.createElement("option");
    option.value = car.id;
    option.textContent = `${car.name} - ₹${car.pricePerDay}/day`;
    carSelect.appendChild(option);
  });

  // Add event listeners to rent buttons
  document.querySelectorAll(".rent-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!currentUser) {
        alert("Please login to rent a car.");
        openAuthModal();
        return;
      }
      const carId = parseInt(btn.dataset.carId);
      const car = carsData.find((c) => c.id === carId);
      if (car) {
        document.getElementById("bookingCar").value = carId;
        document
          .getElementById("booking")
          .scrollIntoView({ behavior: "smooth" });
        calculateTotalPrice();
      }
    });
  });
}

// ======================== BOOKING PRICE CALC ========================
function calculateTotalPrice() {
  const carId = parseInt(document.getElementById("bookingCar").value);
  const pickup = document.getElementById("pickupDate").value;
  const returnDate = document.getElementById("returnDate").value;

  if (!carId || !pickup || !returnDate) {
    document.getElementById("totalPriceDisplay").innerText = "₹0";
    return;
  }

  const car = carsData.find((c) => c.id === carId);
  if (!car) return;

  const start = new Date(pickup);
  const end = new Date(returnDate);
  if (end <= start) {
    document.getElementById("totalPriceDisplay").innerText = "₹0";
    return;
  }
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const total = car.pricePerDay * days;
  document.getElementById("totalPriceDisplay").innerText = `₹${total}`;
  return total;
}

// ======================== BOOKING SUBMIT ========================
function setupBooking() {
  const form = document.getElementById("bookingForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to book a car!");
      openAuthModal();
      return;
    }

    // Clear previous errors
    document
      .querySelectorAll(".error-msg")
      .forEach((el) => (el.innerText = ""));

    let isValid = true;
    const name = document.getElementById("bookingName").value.trim();
    const phone = document.getElementById("bookingPhone").value.trim();
    const carId = document.getElementById("bookingCar").value;
    const pickup = document.getElementById("pickupDate").value;
    const ret = document.getElementById("returnDate").value;

    if (!name) {
      document.getElementById("nameError").innerText = "Full name required";
      isValid = false;
    }
    if (!phone) {
      document.getElementById("phoneError").innerText = "Phone required";
      isValid = false;
    }
    if (!carId) {
      document.getElementById("carError").innerText = "Select a car";
      isValid = false;
    }
    if (!pickup) {
      document.getElementById("pickupError").innerText = "Pickup date required";
      isValid = false;
    }
    if (!ret) {
      document.getElementById("returnError").innerText = "Return date required";
      isValid = false;
    }

    if (pickup && ret && new Date(ret) <= new Date(pickup)) {
      document.getElementById("returnError").innerText =
        "Return date must be after pickup";
      isValid = false;
    }

    if (isValid) {
      const selectedCar = carsData.find((c) => c.id == carId);
      const days = Math.ceil(
        (new Date(ret) - new Date(pickup)) / (1000 * 60 * 60 * 24),
      );
      const totalPrice = selectedCar.pricePerDay * days;
      alert(
        `✅ Booking confirmed!\n\nCar: ${selectedCar.name}\nName: ${name}\nDays: ${days}\nTotal: ₹${totalPrice}\nThank you ${currentUser.name}!`,
      );
      form.reset();
      document.getElementById("totalPriceDisplay").innerText = "₹0";
    }
  });

  document
    .getElementById("bookingCar")
    .addEventListener("change", calculateTotalPrice);
  document
    .getElementById("pickupDate")
    .addEventListener("change", calculateTotalPrice);
  document
    .getElementById("returnDate")
    .addEventListener("change", calculateTotalPrice);
}

// ======================== AUTH MODAL LOGIC ========================
const modal = document.getElementById("authModal");
const loginRegisterBtn = document.getElementById("loginRegisterBtn");
const closeModal = document.querySelector(".close-modal");

function openAuthModal() {
  modal.style.display = "flex";
}

function closeAuthModal() {
  modal.style.display = "none";
}

// Tabs
const loginTab = document.getElementById("loginTabBtn");
const registerTab = document.getElementById("registerTabBtn");
const loginFormElem = document.getElementById("loginForm");
const registerFormElem = document.getElementById("registerForm");

loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  loginFormElem.classList.add("active-form");
  registerFormElem.classList.remove("active-form");
});

registerTab.addEventListener("click", () => {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  registerFormElem.classList.add("active-form");
  loginFormElem.classList.remove("active-form");
});

// Register
document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const msgDiv = document.getElementById("registerMessage");

  if (!name || !email || !password) {
    msgDiv.innerText = "All fields required!";
    msgDiv.style.color = "red";
    return;
  }
  if (password.length < 4) {
    msgDiv.innerText = "Password must be at least 4 characters";
    return;
  }
  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    msgDiv.innerText = "Email already registered!";
    msgDiv.style.color = "red";
    return;
  }
  const newUser = { id: Date.now(), name, email, password };
  users.push(newUser);
  saveUsersToLocal(users);
  msgDiv.innerText = "✅ Registration successful! Please login.";
  msgDiv.style.color = "green";
  setTimeout(() => {
    loginTab.click();
    document.getElementById("registerForm").reset();
    msgDiv.innerText = "";
  }, 1500);
});

// Login
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const msgDiv = document.getElementById("loginMessage");
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    currentUser = { id: user.id, name: user.name, email: user.email };
    saveCurrentSession(currentUser);
    updateUIForLoggedInUser();
    closeAuthModal();
    msgDiv.innerText = "";
    document.getElementById("loginForm").reset();
    alert(`Welcome back, ${user.name}!`);
  } else {
    msgDiv.innerText = "Invalid email or password.";
    msgDiv.style.color = "red";
  }
});

function updateUIForLoggedInUser() {
  if (currentUser) {
    document.getElementById("authNav").style.display = "none";
    document.getElementById("userGreeting").style.display = "flex";
    document.getElementById("userNameDisplay").innerHTML =
      `<i class="fas fa-user-circle"></i> ${currentUser.name}`;
    loginRegisterBtn.style.display = "none";
  } else {
    document.getElementById("authNav").style.display = "block";
    document.getElementById("userGreeting").style.display = "none";
    loginRegisterBtn.style.display = "inline-block";
  }
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  clearSession();
  currentUser = null;
  updateUIForLoggedInUser();
  alert("Logged out successfully.");
});

// ======================== MOBILE MENU & SMOOTH SCROLL ========================
function initMobileMenu() {
  const toggle = document.getElementById("mobileToggle");
  const navLinks = document.getElementById("navLinks");
  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      if (navLinks.style.display === "flex") navLinks.style.display = "none";
      else navLinks.style.display = "flex";
    });
  }
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
        if (window.innerWidth <= 768 && navLinks.style.display === "flex")
          navLinks.style.display = "none";
      }
    });
  });
}

// ======================== EVENT LISTENERS MODAL ========================
loginRegisterBtn.addEventListener("click", (e) => {
  e.preventDefault();
  openAuthModal();
});
closeModal.addEventListener("click", closeAuthModal);
window.addEventListener("click", (e) => {
  if (e.target === modal) closeAuthModal();
});

// ======================== INIT ========================
function init() {
  renderCars();
  setupBooking();
  loadSession();
  initMobileMenu();
}

init();
