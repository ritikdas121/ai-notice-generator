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
app.use(express.static(path.join(__dirname, "..", "public")));

function convertToAMPM(time) {
  let [hours, minutes] = time.split(":");
  let h = parseInt(hours, 10);
  let period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${minutes} ${period}`;
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
  const examTimeAMPM = convertToAMPM(examTime);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
