const formData = document.querySelector(".form-data");
const responseEl = document.getElementById("response");

formData.addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData();
  form.append("description", document.getElementById("description").value);
  form.append("photo", document.getElementById("photo").files[0]);

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
