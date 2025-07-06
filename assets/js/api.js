async function callApiCommand({ functionType, email, password, name }) {
  const url = new URL("http://localhost:3000/apikey-commands");
  url.searchParams.set("function", functionType);
  url.searchParams.set("email", email);
  url.searchParams.set("password", password);
  url.searchParams.set("name", name);

  try {
    const res = await fetch(url, {
      method: "GET",
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

async function callApiCommandPost({ functionType, email, password, name }) {
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

    if (result.SuccessData) {
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
