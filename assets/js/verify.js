function getStoredToken() {
  const userData = localStorage.getItem("onellm_user");
  if (!userData) return null;

  try {
    const parsed = JSON.parse(userData);
    return parsed.token || null;
  } catch (e) {
    console.error("Failed to parse local user data:", e);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const verifyEmailForm = document.getElementById("verify-email-form");
  const verifyCodeForm = document.getElementById("verify-code-form");
  const emailInput = document.getElementById("email");
  const codeInput = document.getElementById("code");

  verifyEmailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value;

    try {
      const response = await fetch("/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const text = await response.text();
      console.log("Raw response:", text);

      const result = JSON.parse(text); // safer than response.json() for debugging
      if (result.Successful) {
        verifyEmailForm.classList.add("hidden");
        verifyCodeForm.classList.remove("hidden");
      } else {
        alert("Error sending verification email: " + result.Failure);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  });

  const token = getStoredToken();

  verifyCodeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let verify_target = "Email";
    const email = emailInput.value;
    const code = codeInput.value;

    if (token) verify_target = "Token";

    try {
      const response = await fetch("/check-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verify_target, email, code, token }),
      });

      const result = await response.json();

      if (result.Successful) {
        if (verify_target == "Email") {
          alert("Email verified successfully!");
          window.location.href = "/login/";
        } else {
          window.location.href = "/dashboard/";
        }
      } else {
        alert("Invalid verification code: " + result.Failure);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  });
});
