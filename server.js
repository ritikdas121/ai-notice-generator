// server.js
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const Groq = require("groq-sdk");

const app = express();
const port = 3000;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.use(bodyParser.json());
app.use(express.static(__dirname));

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
  } = req.body;

  // console.log("Request body:", req.body); // Log incoming data

  const prompt = `Generate a concise, formal, and professional exam notice using the following details:
- Course: ${course}
- Semester: ${semester}
- Session: ${session}
- Exam Type: ${examType}
- Paper Code: ${paperCode}
- Paper Name: ${paperName}
- Exam Date: ${examDate}
- Exam Time: ${examTime} (Change the time into AM/PM format)

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
