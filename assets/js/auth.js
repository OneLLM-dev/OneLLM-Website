async function login(email, password) {
  const params = new URLSearchParams({
    function: "Login",
    email: email,
    password: password,
  });

  const response = await fetch(
    "http://localhost:3000/get-backend?" + params.toString(),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }
  const data = await response.json();

  if (data.user) {
    // Wrap user inside a similar structure
    return {
      email: data.user.email,
      password: password,
      balance: data.user.balance,
    };
  } else {
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
  return data;
}

// Store user data in localStorage
function storeUserData(userData) {
  localStorage.setItem("onellm_user", JSON.stringify(userData));
}

// Get user data from localStorage
function getUserData() {
  const userData = localStorage.getItem("onellm_user");
  return userData ? JSON.parse(userData) : null;
}

// Clear user data from localStorage (for logout)
function clearUserData() {
  localStorage.removeItem("onellm_user");
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
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;
      signup(email, password)
        .then((res) => {
          window.location.href = "/login/"; // Redirect to dashboard
        })
        .catch((err) => {
          console.error("Signup failed:", err);
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
          window.location.href = "/dashboard/"; // Redirect to dashboard
        })
        .catch((err) => {
          console.error("Login failed:", err);
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
async function initDashboard() {
  console.log("User data loaded from localStorage:", getUserData());
  const dashboardContent = document.querySelector(".dashboard-content");
  if (!dashboardContent) return;

  const userData = getUserData();
  if (!userData) {
    // Redirect to login if not logged in
    window.location.href = "/login/";
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
  const params = new URLSearchParams({
    function: "APICount",
    email: userData.email,
    password: userData.password,
  });

  const count = await callApiCommand({
    functionType: "APICount",
    email: userData.email,
    password: userData.password,
  });
  console.log(count);
  const count_num = count.data;
  console.log(count_num);

  const apiKeys = Array(parseInt(count_num)).fill("oa-12345678912345678900");
  if (contentSection) {
    contentSection.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">Email</div>
        <div class="stat-value">${userData.email}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Balance</div>
        <div class="stat-value">${userData.balance || 0}</div>
      </div>
    </div>
  `;

    contentSection.insertAdjacentHTML(
      "beforeend",
      `
    <div class="api-key-section">
      <div class="api-key-header">
        <h2>Your API Keys</h2>
        <button id="generate-api-btn" class="btn btn-primary btn-sm">Generate API Key</button>
        <p class="api-key-warning"><i class="fas fa-exclamation-triangle"></i> Keep your API keys secret</p>
      </div>
      <table class="usage-table" id="api-keys-table">
        <thead>
          <tr>
            <th>Number</th>
            <th>API Key</th>
          </tr>
        </thead>
        <tbody>
          ${
        apiKeys.slice(0, 10).map((key, index) => `
            <tr>
              <td>${index + 1}</td>
              <td><code class="api-key-value">${key}</code></td>
            </tr>
          `).join("")
      }
        </tbody>
      </table>
    </div>
  `,
    );

    // Event listener for Generate button
    document.getElementById("generate-api-btn").addEventListener(
      "click",
      async () => {
        const result = await callApiCommand({
          functionType: "NewAPI",
          email: userData.email,
          password: userData.password,
        });
        console.log(result);

        if (result.type === "success") {
          const tableBody = document.querySelector("#api-keys-table tbody");
          const newIndex = tableBody.rows.length + 1;
          const newKeyRow = `
        <tr>
          <td>${newIndex}</td>
          <td><code class="api-key-value">${result.data}</code></td>
        </tr>
      `;
          tableBody.insertAdjacentHTML("beforeend", newKeyRow);
        } else {
          alert(
            "Failed to generate API key: " +
              (result?.message || "Unknown error"),
          );
        }
      },
    );
  }
  // Add copy functionality for API key
  const copyBtn = contentSection.querySelector(".api-key-actions .btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const apiKey = userData.apikey || "";
      navigator.clipboard.writeText(apiKey);
      alert("API key copied to clipboard!");
    });
  }
}
