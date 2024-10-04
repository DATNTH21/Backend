const formData = document.querySelector(".form-data");
const responseEl = document.getElementById("response");

formData.addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData();

  for (file of document.getElementById("description").files) {
    form.append("description", file);
  }

  for (file of document.getElementById("use-cases").files) {
    form.append("use-cases", file);
  }

  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/usecases",
      data: form,
    });

    if (res.data.status === "success") {
      console.log(res.data.data);
      responseEl.innerText = JSON.stringify(res.data.data["test_cases"]);
    }
  } catch (err) {
    console.log("error", err.response.data.message);
  }
});
