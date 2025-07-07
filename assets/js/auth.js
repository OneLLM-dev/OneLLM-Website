async function login(email, password) {
  const url = "http://localhost:3000/post-backend";

  const payload = {
    function: "Login",
    email,
    password,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.User && data.User.user) {
    return {
      email: data.User.user.email,
      password: password,
      balance: data.User.user.balance,
    };
  } else {
    console.error("Login failed or unexpected response:", data);
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

function storeUserData(userData) {
  localStorage.setItem("onellm_user", JSON.stringify(userData));
}

function getUserData() {
  const userData = localStorage.getItem("onellm_user");
  return userData ? JSON.parse(userData) : null;
}

function clearUserData() {
  localStorage.removeItem("onellm_user");
}

function isLoggedIn() {
  return !!getUserData();
}

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;
      signup(email, password)
        .then(() => {
          window.location.href = "/login/";
        })
        .catch((err) => {
          console.error("Signup failed:", err);
        });
    });
  }

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
          storeUserData(res);
          window.location.href = "/dashboard/";
        })
        .catch((err) => {
          console.error("Login failed:", err);
        });
    });
  }

  const authButtons = document.querySelector(".auth-buttons");
  if (authButtons) {
    if (isLoggedIn()) {
      authButtons.innerHTML = `
        <span class="user-greeting">Hello, ${getUserData().email}</span>
        <button id="logout-btn" class="btn btn-outline">Logout</button>
      `;
      document.getElementById("logout-btn").addEventListener("click", () => {
        clearUserData();
        window.location.href = "/";
      });
    }
  }

  initDashboard();
});

async function initDashboard() {
  const dashboardContent = document.querySelector(".dashboard-content");
  if (!dashboardContent) return;

  const userData = getUserData();
  if (!userData) {
    window.location.href = "/login/";
    return;
  }

  console.log("User data loaded from localStorage:", userData);

  const pageHeader = document.querySelector(".page-header .container");
  if (pageHeader) {
    pageHeader.innerHTML = `
      <h1>Welcome to Your Dashboard</h1>
      <p>Manage your OneLLM account and API usage</p>
    `;
  }

  const contentSection = document.querySelector(".content-section .container");

  const countResult = await callApiCommand({
    functionType: "APICount",
    email: userData.email,
    password: userData.password,
  });

  console.log(countResult);

  const keyNames = countResult.data; // Array of key names (Strings)

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
              <th>Name</th>
              <th>API Key</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${
      keyNames.map((name, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${name}</td>
                <td><code class="api-key-value">Hidden</code></td>
                <td><button class="delete-btn btn btn-danger btn-sm" data-name="${name}">Delete</button></td>
              </tr>
            `).join("")
    }
          </tbody>
        </table>
      </div>
    `;

    // Handle Generate button
    document.getElementById("generate-api-btn").addEventListener(
      "click",
      async () => {
        const keyName = prompt("Enter a name for your API key:");
        if (!keyName) {
          alert("API key name is required.");
          return;
        }

        const result = await callApiCommand({
          functionType: "NewAPI",
          email: userData.email,
          password: userData.password,
          name: keyName,
        });

        console.log(result);

        if (result.type === "success") {
          const tableBody = document.querySelector("#api-keys-table tbody");
          const newIndex = tableBody.rows.length + 1;
          const newKeyRow = `
          <tr>
            <td>${newIndex}</td>
            <td>${keyName}</td>
            <td><code class="api-key-value">${result.data}</code></td>
            <td><button class="delete-btn btn btn-danger btn-sm" data-name="${keyName}">Delete</button></td>
          </tr>
        `;
          tableBody.insertAdjacentHTML("beforeend", newKeyRow);

          // Re-attach delete handler for new row
          const newDeleteBtn = tableBody.querySelector(
            `tr:nth-child(${newIndex}) .delete-btn`,
          );
          newDeleteBtn.addEventListener("click", async (e) => {
            const name = e.target.getAttribute("data-name");
            if (
              !confirm(`Are you sure you want to delete the API key "${name}"?`)
            ) return;

            const deleteResult = await callApiCommand({
              functionType: "DelAPI",
              email: userData.email,
              password: userData.password,
              name: name,
            });

            console.log(deleteResult);

            if (deleteResult.type === "success") {
              e.target.closest("tr").remove();
            } else {
              alert(
                "Failed to delete API key: " +
                  (deleteResult?.message || "Unknown error"),
              );
            }
          });
        } else {
          alert(
            "Failed to generate API key: " +
              (result?.message || "Unknown error"),
          );
        }
      },
    );

    // Attach Delete handlers for existing keys
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const name = e.target.getAttribute("data-name");
        if (
          !confirm(`Are you sure you want to delete the API key "${name}"?`)
        ) return;

        const result = await callApiCommand({
          functionType: "DelAPI",
          email: userData.email,
          password: userData.password,
          name: name,
        });

        if (result.type === "success") {
          e.target.closest("tr").remove();
        } else {
          alert(
            "Failed to delete API key: " + (result?.message || "Unknown error"),
          );
        }
      });
    });
  }
}
