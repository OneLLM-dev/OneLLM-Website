async function callApiCommand({ functionType, email, password }) {
  const url = new URL("http://localhost:3000/apikey-commands");
  url.searchParams.set("function", functionType);
  url.searchParams.set("email", email);
  url.searchParams.set("password", password);

  try {
    const res = await fetch(url, {
      method: "GET",
    });

    const text = await res.text();
    console.log(text);

    if (!text) {
      console.error("Empty response from server");
      return { type: "failure", message: "Empty response" };
    }

    const result = JSON.parse(text);

    if (result.SuccessData) {
      console.log("API Key:", result.SuccessData);
      return { type: "success", data: result.SuccessData };
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
