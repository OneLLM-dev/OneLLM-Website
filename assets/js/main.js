function isLoggedIn() {
  const userData = localStorage.getItem("onellm_user");
  return !!userData;
}

document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("active");
      this.classList.toggle("active");
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });
  function getUserData() {
    const userData = localStorage.getItem("onellm_user");
    return userData ? JSON.parse(userData) : null;
  }

  function isLoggedIn() {
    return !!getUserData();
  }

  function updateAuthButtons() {
    const userData = getUserData();
    const authButtonsContainer = document.querySelector(".auth-buttons");

    if (authButtonsContainer) {
      authButtonsContainer.innerHTML = ""; // Clear existing buttons

      if (userData) {
        // User is logged in
        const dashboardButton = document.createElement("a");
        dashboardButton.href = "/dashboard/";
        dashboardButton.className = "btn btn-primary";
        dashboardButton.textContent = "Dashboard";
        authButtonsContainer.appendChild(dashboardButton);
      } else {
        // User is not logged in
        const loginButton = document.createElement("a");
        loginButton.href = "/login/";
        loginButton.className = "btn btn-outline";
        loginButton.textContent = "Login";

        const signupButton = document.createElement("a");
        signupButton.href = "/signup/";
        signupButton.className = "btn btn-primary";
        signupButton.textContent = "Sign Up";

        authButtonsContainer.appendChild(loginButton);
        authButtonsContainer.appendChild(signupButton);
      }
    }
  }

  function updateCTASection() {
    const ctaContainer = document.getElementById("cta-container");
    if (ctaContainer) {
      if (!isLoggedIn()) {
        ctaContainer.innerHTML = `
          <section class="cta-section" id="cta-section">
            <div class="container">
              <div class="cta-card">
                <h2>Ready to simplify your AI integration?</h2>
                <p>
                  Get started with OneLLM today and experience the power of unified AI
                  access.
                </p>
                <a href="/signup/" class="btn btn-primary">Create Free Account</a>
              </div>
            </div>
          </section>
        `;
      } else {
        ctaContainer.innerHTML = "";
      }
    }
  }

  updateAuthButtons();
  updateCTASection();
});
