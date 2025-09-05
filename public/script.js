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
    const copyBtn = document.getElementById("copy-button");

    noticeText.textContent = notice;
    outputSection.classList.remove("hidden");
    copyBtn.classList.remove("hidden");

    copyBtn.onclick = () => {
      navigator.clipboard
        .writeText(notice)
        .then(() => {
          showToast("Copied to clipboard!");
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

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
