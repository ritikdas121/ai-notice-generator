const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
const Groq = require("groq-sdk");

const app = express();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.use(bodyParser.json());
// Updated to use a more reliable path for static files, assuming public is at project root
app.use(express.static(path.join(__dirname, "..", "public")));

function convertToAMPM(time) {
  // Add input validation
  if (!time || typeof time !== "string") return "Invalid Time";
  const [hours, minutes] = time.split(":");
  if (!hours || !minutes) return "Invalid Time Format";
  let h = parseInt(hours, 10);
  if (isNaN(h) || h < 0 || h > 23) return "Invalid Hour";
  let m = parseInt(minutes, 10);
  if (isNaN(m) || m < 0 || m > 59) return "Invalid Minutes";
  let period = "AM";
  if (h === 0) h = 12;
  else if (h === 12) period = "PM";
  else if (h > 12) {
    h -= 12;
    period = "PM";
  } else if (h < 0) h = 0; // Safeguard
  return `${h}:${minutes.padStart(2, "0")} ${period}`;
}

app.post("/generate", async (req, res) => {
  const {
    course,
    semester,
    session,
    "exam-type": examType,
    "paper-code": paperCode,
    "paper-name": paperName,
    "exam-date": examDate,
    "exam-time": examTime,
  } = req.body || {};

  // Default to empty strings if undefined to avoid prompt errors
  const examTimeAMPM = convertToAMPM(examTime || "00:00");

  const prompt = `Generate a concise, formal, and professional exam notice using the following details:
- Course: ${course || "N/A"}
- Semester: ${semester || "N/A"}
- Session: ${session || "N/A"}
- Exam Type: ${examType || "N/A"}
- Paper Code: ${paperCode || "N/A"}
- Paper Name: ${paperName || "N/A"}
- Exam Date: ${examDate || "N/A"}
- Exam Time: ${examTimeAMPM}

The notice should be in a standard notification format and easy to read. Do not add any placeholders. Use only the provided details`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 300,
    });

    const notice = completion.choices[0].message.content.trim();
    res.json({ notice });
  } catch (error) {
    console.error("Groq API error:", error.message, error.stack);
    res
      .status(500)
      .json({ error: "Failed to generate notice", details: error.message });
  }
});

// Add listener for Railway, using process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Keep for potential Vercel redeployment
