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

    const tableEl = document.getElementById("tables");
    if (res.data.status === "success") {
      const testcases = res.data.data["testcases"].flat();
      for (const testcase of testcases) {
        tableEl.insertAdjacentHTML(
          "beforeend",
          `
        <table class="table">
          <tr>
            <th>test case description</th>
            <th>${testcase["test_case_description"]}</th>
          </tr>
          <tr>
            <td>Pre conditions</td>
            <td>${JSON.stringify(testcase["pre-conditions"])}</td>
          </tr>
          <tr>
            <td>Steps</td>
            <td>${JSON.stringify(testcase["steps"])}</td>
          </tr>
          <tr>
            <td>Expected result</td>
            <td>${JSON.stringify(testcase["expected_result"])}</td>
          </tr>
        </table>
        `
        );
      }
    }
  } catch (err) {
    console.log("error", err.response.data.message);
  }
});
