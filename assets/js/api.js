async function callApiCommand({ functionType, email, password, name }) {
  const url = "http://localhost:3000/apikey-commands";

  const payload = {
    function: functionType,
    email,
    password,
    name,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    if (!text) {
      console.error("Empty response from server");
      return { type: "failure", message: "Empty response" };
    }

    const result = JSON.parse(text);

    if (result.SuccessData || result.SuccessVecData || result.Successful) {
      return {
        type: "success",
        data: result.SuccessData || result.SuccessVecData || result.Successful,
      };
    } else if (result.Failure) {
      console.error("Error:", result.Failure);
      return { type: "failure", message: result.Failure };
    } else {
      console.error("Unknown response format:", result);
      return { type: "failure", message: "Unknown response format" };
    }
  } catch (err) {
    console.error("Fetch error:", err);
    return { type: "failure", message: err.message || "Unknown error" };
  }
}
