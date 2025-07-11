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

  // Page transition logic
  const body = document.body;
  // Ensure body is visible by default, transition only on navigation
  body.classList.remove('page-transition-out');
  body.classList.add('page-transition-in');

  // Add event listener for all internal links to trigger page-out transition
  document.querySelectorAll('a[href^="/"]:not([href^="#"]):not([target="_blank"])').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      // Only apply transition if the link is to a different page within the site
      if (href && href !== window.location.pathname) {
        e.preventDefault();
        body.classList.remove('page-transition-in');
        body.classList.add('page-transition-out');
        setTimeout(() => {
          window.location.href = href;
        }, 500); // Match CSS transition duration
      }
    });
  });

  // Apply fade-in-slide-up to headings and paragraphs
  document.querySelectorAll('h1, h2, h3, p').forEach((element) => {
    if (!element.closest('footer') && !element.closest('#cookie-notice')) { // Exclude footer and cookie notice
      element.classList.add('fade-in-slide-up');
    }
  });

  // Apply fade-in to images
  document.querySelectorAll('img').forEach((element) => {
    element.classList.add('fade-in-image');
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

  function handleCookieNotice() {
    const cookieNotice = document.getElementById("cookie-notice");
    const acceptCookiesButton = document.getElementById("accept-cookies");

    const hasAcceptedCookies = localStorage.getItem("onellm_cookies_accepted");

    if (!isLoggedIn() && !hasAcceptedCookies) {
      cookieNotice.style.display = "flex";
    }

    acceptCookiesButton.addEventListener("click", function () {
      cookieNotice.style.display = "none";
      localStorage.setItem("onellm_cookies_accepted", "true");
    });
  }

  updateAuthButtons();
  updateCTASection();
  handleCookieNotice();
});
