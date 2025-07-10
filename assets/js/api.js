async function callApiCommand({ functionType, email, token, name }) {
  const url = "/apikey-commands";

  const payload = {
    function: functionType,
    token,
    email,
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

    console.log(payload);

    const text = await res.text();
    console.log(text);

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
