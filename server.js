const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

// Catch unhandled promise rejections and uncaught exceptions to prevent process crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Enneagram Type Descriptions and Profiles for beautiful reports
const TYPE_PROFILES = {
  1: {
    title: "The Reformer",
    role: "Integrity, correctness, improvement, fairness",
    description: "Type Ones are conscientious and ethical, with a strong sense of right and wrong. They are teachers, crusaders, and advocates for change: constantly striving to improve things, but afraid of making mistakes.",
    keyTraits: ["Principled", "Purposeful", "Self-Controlled", "Perfectionistic"]
  },
  2: {
    title: "The Helper",
    role: "Care, relationships, giving, emotional attunement",
    description: "Type Twos are empathetic, sincere, and warm-hearted. They are friendly, generous, and self-sacrificing, but can also be sentimental, flattering, and people-pleasing. They well-meaningly want to be close to others.",
    keyTraits: ["Caring", "Interpersonal", "Demonstrative", "Altruistic"]
  },
  3: {
    title: "The Achiever",
    role: "Success, image, performance, productivity",
    description: "Type Threes are self-assured, attractive, and charming. Ambitious, competent, and energetic, they can also be status-conscious and highly driven for advancement. They are diplomatic and poised, but can be overly concerned with their image.",
    keyTraits: ["Adaptable", "Excelling", "Driven", "Image-Conscious"]
  },
  4: {
    title: "The Individualist",
    role: "Authenticity, uniqueness, depth, emotional meaning",
    description: "Type Fours are self-aware, sensitive, and reserved. They are emotionally honest, creative, and personal, but can also be moody and self-conscious. They search for meaning and authenticity in all things.",
    keyTraits: ["Expressive", "Dramatic", "Self-Absorbed", "Temperamental"]
  },
  5: {
    title: "The Investigator",
    role: "Knowledge, privacy, observation, independence",
    description: "Type Fives are alert, insightful, and curious. They are able to concentrate and focus on developing complex ideas and skills. Independent, innovative, and inventive, they can also become preoccupied with their thoughts and imaginary constructs.",
    keyTraits: ["Perceptive", "Innovative", "Secretive", "Isolated"]
  },
  6: {
    title: "The Loyalist",
    role: "Security, loyalty, vigilance, doubt",
    description: "Type Sixes are reliable, hard-working, responsible, and trustworthy. Excellent troubleshooting systems, they foresee problems and foster cooperation, but can also become defensive, evasive, and highly anxious.",
    keyTraits: ["Engaging", "Responsible", "Anxious", "Suspicious"]
  },
  7: {
    title: "The Enthusiast",
    role: "Fun, adventure, variety, optimism, freedom",
    description: "Type Sevens are extroverted, optimistic, versatile, and spontaneous. Playful, high-spirited, and practical, they can also misapply their talents, becoming over-extended, scattered, and undisciplined. They constantly seek new and exciting experiences.",
    keyTraits: ["Spontaneous", "Versatile", "Distractible", "Scattered"]
  },
  8: {
    title: "The Challenger",
    role: "Power, control, directness, protection, confrontation",
    description: "Type Eights are self-confident, strong, and assertive. Protective, resourceful, straight-talking, and decisive, they can also be ego-centric and domineering. They feel they must control their environment.",
    keyTraits: ["Self-Confident", "Decisive", "Willful", "Confrontational"]
  },
  9: {
    title: "The Peacemaker",
    role: "Harmony, merging, avoiding conflict, inner peace",
    description: "Type Nines are accepting, trusting, and stable. They are usually creative, optimistic, and supportive, but can also be too willing to go along with others to keep the peace. They want everything to go smoothly and without conflict.",
    keyTraits: ["Receptive", "Reassuring", "Agreeable", "Complacent"]
  }
};

// Parse Enneagram_Questionnaire_By_Type.md
function parseQuestionnaire() {
  const filePath = path.join(__dirname, 'Enneagram_Questionnaire_By_Type.md');
  if (!fs.existsSync(filePath)) {
    throw new Error('Enneagram_Questionnaire_By_Type.md not found in the workspace.');
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const questionnaire = {};
  let currentTypeNum = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Match Header e.g. ## TYPE 1 — THE REFORMER
    const typeHeaderMatch = line.match(/^##\s+TYPE\s+(\d+)\s*[-—–]\s*(.*)$/i);
    if (typeHeaderMatch) {
      currentTypeNum = parseInt(typeHeaderMatch[1], 10);
      questionnaire[currentTypeNum] = {
        typeNumber: currentTypeNum,
        typeName: typeHeaderMatch[2].trim(),
        coreOrientation: '',
        questions: []
      };
      continue;
    }

    // Match Core Orientation
    const coreMatch = line.match(/^\*Core orientation:\s*(.*)\*$/i);
    if (coreMatch && currentTypeNum) {
      questionnaire[currentTypeNum].coreOrientation = coreMatch[1].trim();
      continue;
    }

    // Match Question Line e.g. 1. I strive...
    const questionMatch = line.match(/^(\d+)\.\s*(.*)$/);
    if (questionMatch && currentTypeNum) {
      const originalNum = parseInt(questionMatch[1], 10);
      let text = questionMatch[2].trim();

      // Clean prefix "Statement ***" if present
      text = text.replace(/^(Statement\s+\d+[\s.:-]*|\bStatement\b[\s.:-]*)/i, '').trim();

      questionnaire[currentTypeNum].questions.push({
        originalNumber: originalNum,
        text: text
      });
    }
  }

  return questionnaire;
}

// Endpoint to fetch all questions grouped by type
app.get('/api/questions', (req, res) => {
  try {
    const data = parseQuestionnaire();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error parsing questionnaire:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to send the report email
app.post('/api/send-report', async (req, res) => {
  const { email, scores, dominantType, answers } = req.body;

  if (!email || !scores || !dominantType) {
    return res.status(400).json({ success: false, message: 'Missing required parameters.' });
  }

  // Find dominant profile details
  const profile = TYPE_PROFILES[dominantType] || { title: `Type ${dominantType}`, role: 'Unknown', description: '', keyTraits: [] };

  // Create formatted report sections
  const scoreTableRows = Object.entries(scores)
    .map(([typeNum, score]) => {
      const typeProfile = TYPE_PROFILES[typeNum] || { title: `Type ${typeNum}` };
      const percentage = Math.round(score * 20); // convert 1-5 scale to % (5 -> 100%)
      const isDominant = parseInt(typeNum, 10) === parseInt(dominantType, 10);
      return `
        <tr style="background-color: ${isDominant ? 'rgba(99, 102, 241, 0.15)' : 'transparent'}; font-weight: ${isDominant ? 'bold' : 'normal'};">
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Type ${typeNum} — ${typeProfile.title}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${parseFloat(score).toFixed(2)} / 5.00</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${percentage}%</td>
        </tr>
      `;
    })
    .join('');

  const answersList = answers
    .map((ans, idx) => {
      const typeProfile = TYPE_PROFILES[ans.typeNumber] || { title: `Type ${ans.typeNumber}` };
      return `
        <div style="padding: 10px; border-bottom: 1px solid #edf2f7; margin-bottom: 5px;">
          <p style="margin: 0; font-size: 14px; color: #4a5568;"><strong>Q${idx + 1}:</strong> ${ans.text}</p>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #718096;">
            Category: <strong>Type ${ans.typeNumber} (${typeProfile.title})</strong> | 
            Your Response: <strong style="color: #4f46e5;">${ans.rating} / 5</strong>
          </p>
        </div>
      `;
    })
    .join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Enneagram Assessment Report</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2d3748; background-color: #f7fafc; padding: 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; border: 1px solid #e2e8f0;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 20px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Your Enneagram Results</h1>
          <p style="margin: 10px 0 0 0; font-size: 15px; opacity: 0.9;">Personalized Personality Archetype Report</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px 20px;">
          <h2 style="font-size: 20px; color: #1a202c; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 0;">Your Dominant Type: Type ${dominantType} &mdash; ${profile.title}</h2>
          <p style="font-style: italic; color: #4f46e5; font-weight: 600; font-size: 16px; margin: 10px 0;">
            "Core Orientation: ${profile.role}"
          </p>
          <p style="font-size: 15px; color: #4a5568;">
            ${profile.description}
          </p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f7fafc; border-left: 4px solid #4f46e5; border-radius: 0 8px 8px 0;">
            <strong style="display: block; margin-bottom: 5px; font-size: 14px; text-transform: uppercase; color: #718096; letter-spacing: 0.5px;">Key Traits:</strong>
            <span style="font-size: 15px; font-weight: 500; color: #2d3748;">
              ${profile.keyTraits.join(', ')}
            </span>
          </div>

          <!-- Score Breakdown -->
          <h3 style="margin-top: 30px; font-size: 18px; color: #1a202c;">Score Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
            <thead>
              <tr style="background-color: #f7fafc; text-align: left;">
                <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; color: #4a5568;">Enneagram Type</th>
                <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; color: #4a5568; text-align: center;">Average Rating</th>
                <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; color: #4a5568; text-align: right;">Match Score</th>
              </tr>
            </thead>
            <tbody>
              ${scoreTableRows}
            </tbody>
          </table>

          <!-- Details Accordion/Section -->
          <h3 style="margin-top: 35px; font-size: 18px; color: #1a202c; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Your Questionnaire Responses</h3>
          <div style="max-height: 400px; overflow-y: auto; border: 1px solid #edf2f7; border-radius: 8px; padding: 10px; margin-top: 10px; background-color: #fafbfc;">
            ${answersList}
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096;">
          <p style="margin: 0 0 5px 0;">Generated by the Interactive Enneagram Dashboard.</p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Enneagram Projects. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create SMTP transporter if configured
  const smtpHost = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : '';
  const smtpUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : '';
  const useSmtp = smtpHost && smtpUser && smtpPass;
  
  let transportConfig;
  if (useSmtp) {
    transportConfig = {
      host: smtpHost,
      port: parseInt((process.env.SMTP_PORT || '587').toString().trim(), 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      connectionTimeout: 10000, // 10 seconds to avoid hanging in production
      greetingTimeout: 10000,   // 10 seconds to avoid hanging in production
      socketTimeout: 10000      // 10 seconds to avoid hanging in production
    };
  }

  // Create reports folder if not exists
  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  const timestamp = Date.now();
  const reportFilename = `report_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.html`;
  const reportPath = path.join(reportsDir, reportFilename);
  fs.writeFileSync(reportPath, emailHtml, 'utf-8');

  if (useSmtp) {
    console.log(`[Email Request] Attempting to send real SMTP email...`);
    console.log(`[Email Request] To: ${email}`);
    console.log(`[Email Request] Via Host: ${smtpHost}:${process.env.SMTP_PORT || '587'}`);
    console.log(`[Email Request] Report HTML saved to local backup: ${reportPath}`);
    
    try {
      const transporter = nodemailer.createTransport(transportConfig);
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Enneagram Dashboard" <no-reply@example.com>',
        to: email,
        subject: `Your Enneagram Personality Report: Type ${dominantType} — ${profile.title}`,
        html: emailHtml
      });

      console.log(`[Email Success] Email successfully sent to ${email}`);
      return res.json({
        success: true,
        message: 'Report sent successfully via email!',
        savedLocal: true,
        localFile: reportFilename
      });
    } catch (err) {
      console.error('❌ Error sending real email via SMTP:', err);
      return res.status(500).json({
        success: false,
        message: `Failed to send email: ${err.message}`,
        savedLocal: true,
        localFile: reportFilename,
        error: err.message
      });
    }
  } else {
    // Return mock success with instructions
    console.log(`[Mock Mode] Email sending skipped (SMTP not configured).`);
    console.log(`[Mock Mode] To: ${email}`);
    console.log(`[Mock Mode] Report HTML saved to: ${reportPath}`);
    
    return res.json({
      success: true,
      message: 'Report generated successfully!',
      savedLocal: true,
      localFile: reportFilename,
      mocked: true,
      reportHtml: emailHtml // send back to frontend for optional preview/download
    });
  }
});

// Wildcard route to serve frontend index.html for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Enneagram Dashboard server is running on port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  
  const smtpHost = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : '';
  const smtpUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : '';
  const useSmtp = smtpHost && smtpUser && smtpPass;
  
  if (useSmtp) {
    console.log(`SMTP Status: ENABLED`);
    console.log(`SMTP Host:   ${smtpHost}`);
    console.log(`SMTP Port:   ${process.env.SMTP_PORT || '587'}`);
    console.log(`SMTP User:   ${smtpUser}`);
    console.log(`SMTP Secure: ${process.env.SMTP_SECURE || 'false'}`);
  } else {
    console.log(`SMTP Status: DISABLED (Running in local Mock Mode)`);
    console.log(`Missing variables: ${[!smtpHost && 'SMTP_HOST', !smtpUser && 'SMTP_USER', !smtpPass && 'SMTP_PASS'].filter(Boolean).join(', ')}`);
  }
  console.log(`==================================================`);
});
