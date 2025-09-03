document.getElementById("input-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to generate notice");
    }

    const { notice } = await response.json();

    const outputSection = document.getElementById("output-section");
    const noticeText = document.getElementById("notice-text");

    noticeText.textContent = notice;
    outputSection.classList.remove("hidden");

    document.getElementById("copy-button").onclick = () => {
      navigator.clipboard
        .writeText(notice)
        .then(() => {
          alert("Copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    };
  } catch (error) {
    console.error(error);
    alert("Error generating notice. Please try again.");
  }
});
