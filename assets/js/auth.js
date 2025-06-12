async function login(email, password) {
  const params = new URLSearchParams({
    function: "Login",
    email: email,
    password: password,
  });

  const response = await fetch("http://localhost:3000/get-backend?" + params.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

        console.log(response)

        const data = await response.json();
console.log("Login response data:", data);

 if (data.user) {
  console.log("User email:", data.user.email);
  console.log("API Key:", data.user.apikey);
  console.log("Balance:", data.user.balance);
  // Wrap user inside a similar structure
  return {
    email: data.user.email,
    apikey: data.user.apikey,
    balance: data.user.balance,
  };
}else {
  console.log("Login failed: No user found");
  return null;
}
}
async function signup(email, password) {
  const response = await fetch("http://localhost:3000/post-backend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      function: "Signup",
      email,
      password,
      apikey: "",
      data: {},
    }),
  });

  if (!response.ok) {
    throw new Error(`Signup failed: ${response.status}`);
  }

  const data = await response.json();
  console.log("Signup response data:", data);
  console.log("User email:", data.email);
  console.log("API Key:", data.apikey);
  console.log("Balance:", data.balance);
  return data;
}

// Store user data in localStorage
function storeUserData(userData) {
  localStorage.setItem('onellm_user', JSON.stringify(userData));
}

// Get user data from localStorage
function getUserData() {
  const userData = localStorage.getItem('onellm_user');
  return userData ? JSON.parse(userData) : null;
}

// Clear user data from localStorage (for logout)
function clearUserData() {
  localStorage.removeItem('onellm_user');
}

// Check if user is logged in
function isLoggedIn() {
  return !!getUserData();
}

document.addEventListener("DOMContentLoaded", () => {
  // Handle signup form submission
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      console.log("Signup was called");
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;
      signup(email, password)
        .then((res) => {
          console.log("Signup success:", res);
          storeUserData(res); // Store user data
          alert("Signup successful!");
          window.location.href = "dashboard.html"; // Redirect to dashboard
        })
        .catch((err) => {
          console.error("Signup failed:", err);
          alert("Signup failed!");
        });
    });
  }

  // Handle login form submission
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      console.log("Login was called");
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;
      login(email, password)
        .then((res) => {
          console.log("Login success:", res);
          storeUserData(res); // Store user data
          alert("Login successful!");
          window.location.href = "dashboard.html"; // Redirect to dashboard
        })
        .catch((err) => {
          console.error("Login failed:", err);
          alert("Login failed!");
        });
    });
  }

  // Check login status and update UI accordingly
  const authButtons = document.querySelector(".auth-buttons");
  if (authButtons) {
    if (isLoggedIn()) {
      // User is logged in, show logout button
      authButtons.innerHTML = `
        <span class="user-greeting">Hello, ${getUserData().email}</span>
        <button id="logout-btn" class="btn btn-outline">Logout</button>
      `;
      
      // Add logout functionality
      document.getElementById("logout-btn").addEventListener("click", () => {
        clearUserData();
        window.location.href = "/";
      });
    }
  }

  // Initialize dashboard if on dashboard page
  initDashboard();
});

// Initialize dashboard with user data
function initDashboard() {
        console.log("User data loaded from localStorage:", getUserData());
  const dashboardContent = document.querySelector(".dashboard-content");
  if (!dashboardContent) return;

  const userData = getUserData();
  if (!userData) {
    // Redirect to login if not logged in
    window.location.href = "login.html";
    return;
  }

  // Update page header
  const pageHeader = document.querySelector(".page-header .container");
  if (pageHeader) {
    pageHeader.innerHTML = `
      <h1>Welcome to Your Dashboard</h1>
      <p>Manage your OneLLM account and API usage</p>
    `;
  }

  // Update content section with user data
  const contentSection = document.querySelector(".content-section .container");
  if (contentSection) {
    contentSection.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-title">Email</div>
          <div class="stat-value">${userData.email}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">API Key</div>
          <div class="stat-value">${userData.apikey || 'No API Key'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Balance</div>
          <div class="stat-value">${userData.balance || 0}</div>
        </div>
      </div>

      <div class="api-key-section">
        <div class="api-key-header">
          <h2>Your API Key</h2>
        </div>
        <div class="api-key-container">
          <div class="api-key-value">${userData.apikey || 'No API Key available'}</div>
          <div class="api-key-actions">
            <button class="btn btn-outline btn-sm">Copy</button>
          </div>
        </div>
        <div class="api-key-warning">
          <i class="fas fa-exclamation-triangle"></i>
          <span>Keep your API key secure. Do not share it publicly.</span>
        </div>
      </div>
    `;

    // Add copy functionality for API key
    const copyBtn = contentSection.querySelector(".api-key-actions .btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const apiKey = userData.apikey || '';
        navigator.clipboard.writeText(apiKey);
        alert("API key copied to clipboard!");
      });
    }
  }
}
