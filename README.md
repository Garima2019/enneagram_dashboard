# Interactive Enneagram Dashboard

A premium, interactive single-page HTML/JS dashboard that implements a multi-stage Enneagram personality questionnaire. It reads, parses, and scores user responses using only the data inside `Enneagram_Questionnaire_By_Type.md`.

## Features
- **Aesthetic Glassmorphism Design**: Features smooth neon background gradients, dark/light theme switching, responsive layouts, and interactive micro-animations.
- **Dynamic File Parsing**: Reads `Enneagram_Questionnaire_By_Type.md` directly via the backend API or falls back to client-side parsing.
- **Multi-Stage Adaptive Testing**:
  1. **Stage 1 (Baseline)**: Prompts user with 37 questions (exactly 4 random questions per Enneagram type plus the hardcoded culinary motivation scenario question). Questions are cleaned of prefixes (like "Statement") and re-numbered sequentially.
  2. **Stage 2 (Adaptive Injection)**: Identifies the highest-scoring Enneagram type(s) from the baseline. If there is a tie, all tied types are selected.
  3. **Stage 3 (Deep Dive)**: Dynamically injects exactly 15 additional sequential, consecutive questions exclusive to the top-scoring tied type(s) that were not asked in the baseline.
  4. **Stage 4 (Recalculation)**: Recalculates final scores using all answered questions. Non-top types are scored from baseline answers, while top types are scored from baseline + deep dive answers. Scores are normalized to an average 1.0–5.0 scale for a fair comparison.
  5. **Stage 5 (Analytics & Reporting)**: Visualizes results using interactive Chart.js charts (toggleable Radar or Bar) and progress bars. Provides a textbox to email a comprehensive HTML report, falling back to local file saving.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended, test suite run on v24)

### Installation
1. Clone or navigate to the project directory:
   ```bash
   cd enneagram-dashbaord
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the local server:
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

## Configuration (.env)
You can configure a real mail transport for the "Send Report" feature by copying the variables inside `.env` and setting up SMTP:
- `SMTP_HOST`: The SMTP server host (e.g., `smtp.gmail.com`).
- `SMTP_PORT`: The SMTP server port (e.g., `587` or `465`).
- `SMTP_SECURE`: `true` for SSL/TLS, `false` for STARTTLS.
- `SMTP_USER`: The SMTP user or email account.
- `SMTP_PASS`: The SMTP account password or app-specific key.
- `EMAIL_FROM`: The sender label and email address.

**SMTP Fallback Mode**: If SMTP variables are left blank, the server runs in **mock mode**. When clicking "Send Report", it generates the report, writes a full HTML file to the local `reports/` folder, and returns a successful response to the dashboard. The dashboard will allow downloading the report locally.

## Project Structure
- [Enneagram_Questionnaire_By_Type.md](file:///D:/Hochschule/CompanyBased_Internship/enneagram_projects/enneagram-dashbaord/Enneagram_Questionnaire_By_Type.md) - The source questionnaire.
- [server.js](file:///D:/Hochschule/CompanyBased_Internship/enneagram_projects/enneagram-dashbaord/server.js) - Node/Express backend exposing parsing and email endpoints.
- [public/](file:///D:/Hochschule/CompanyBased_Internship/enneagram_projects/enneagram-dashbaord/public) - Web root folder.
  - [index.html](file:///D:/Hochschule/CompanyBased_Internship/enneagram_projects/enneagram-dashbaord/public/index.html) - Dashboard layout.
  - [styles.css](file:///D:/Hochschule/CompanyBased_Internship/enneagram_projects/enneagram-dashbaord/public/styles.css) - Modern theme styles and rating widgets.
  - [app.js](file:///D:/Hochschule/CompanyBased_Internship/enneagram_projects/enneagram-dashbaord/public/app.js) - State controller, dynamic calculations, and chart builder.
- [reports/](file:///D:/Hochschule/CompanyBased_Internship/enneagram_projects/enneagram-dashbaord/reports) - (Generated) Local storage directory for report copies.
- [.env](file:///D:/Hochschule/CompanyBased_Internship/enneagram_projects/enneagram-dashbaord/.env) - Local settings template.
- [package.json](file:///D:/Hochschule/CompanyBased_Internship/enneagram_projects/enneagram-dashbaord/package.json) - Application manifest.
