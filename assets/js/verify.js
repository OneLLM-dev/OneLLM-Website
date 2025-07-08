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

  verifyCodeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const code = codeInput.value;

    try {
      const response = await fetch("/check-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const result = await response.json();

      if (result.Successful) {
        alert("Email verified successfully!");
        window.location.href = "/login";
      } else {
        alert("Invalid verification code: " + result.Failure);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  });
});
