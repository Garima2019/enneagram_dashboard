const express = require('express');
const path = require('path');
const fs = require('fs');
// const nodemailer = require('nodemailer');
const cors = require('cors');
const PDFDocument = require('pdfkit');
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
    keyTraits: ["Principled", "Purposeful", "Self-Controlled", "Perfectionistic"],
    coreMotivations: {
      keyDrivers: "Striving for absolute accuracy, integrity, and personal improvement in everything they do.",
      biggestFear: "Being corrupt, evil, defective, or making irreversible errors.",
      coreValues: "Integrity, justice, order, honesty, and high quality standards.",
      decisionMaking: "Principled and objective. They weigh options against internal rules and standards of fairness, choosing the morally correct path.",
      stressReactions: "Under stress, Ones move towards Type 4. They can become moody, self-critical, feel unappreciated, and turn inward, feeling longing and resentment.",
      securityTriggers: "When feeling secure, Ones move towards Type 7. They become more spontaneous, joyful, and willing to try new experiences, relaxing their rigid standards."
    },
    coreSummary: {
      fear: "Being bad, defective, evil, or corrupt.",
      desire: "To have integrity, to be good, balanced, and correct.",
      weakness: "Resentment (Anger) — constantly fighting imperfection in themselves and the world.",
      soulMessage: "You are good and correct just as you are."
    },
    arrows: {
      growth: {
        type: 7,
        explanation: "Shifting to Type 7 brings joy, flexibility, and playfulness, allowing you to relax your inner critic and enjoy the present moment."
      },
      stress: {
        type: 4,
        explanation: "Shifting to Type 4 brings deep feelings, but also self-pity and moodiness, making you feel uniquely flawed or misunderstood."
      }
    },
    wings: {
      9: { archetype: "1w9: The Idealist", influence: "Blends Type 1's drive for perfection with Type 9's calm, peaceful nature. They are more introverted, gentle, and objective." },
      2: { archetype: "1w2: The Advocate", influence: "Blends Type 1's principles with Type 2's desire to help others. They are more active, warm, and vocal about social reform." }
    },
    nextSteps: {
      personalGrowth: "Practice self-compassion; silence your inner critic and accept that mistakes are opportunities for learning.",
      relationship: "Accept that others have different paces and methods, and appreciate their unique contributions without trying to correct them.",
      career: "Seek roles that value quality and integrity but avoid over-policing others or taking on too much responsibility.",
      stressManagement: "Engage in play and unstructured creative hobbies where there are no 'right' or 'wrong' answers.",
      dailyHabit: "Journal 3 things you did 'well enough' today without trying to fix or improve them."
    }
  },
  2: {
    title: "The Helper",
    role: "Care, relationships, giving, emotional attunement",
    description: "Type Twos are empathetic, sincere, and warm-hearted. They are friendly, generous, and self-sacrificing, but can also be sentimental, flattering, and people-pleasing. They sincerely want to be close to others.",
    keyTraits: ["Caring", "Interpersonal", "Demonstrative", "Altruistic"],
    coreMotivations: {
      keyDrivers: "Desire to feel loved, needed, and appreciated; to express their feelings towards others.",
      biggestFear: "Being unwanted, worthless, or unloved.",
      coreValues: "Compassion, connection, altruism, and relationship harmony.",
      decisionMaking: "Relational and empathetic. Decisions are guided by how they will affect others and strengthen relationships.",
      stressReactions: "Under stress, Twos move towards Type 8. They can become aggressive, demanding, and controlling, directly voicing their anger and needs.",
      securityTriggers: "When feeling secure, Twos move towards Type 4. They explore their own authentic feelings, creative desires, and begin practicing self-care."
    },
    coreSummary: {
      fear: "Being unwanted, unloved, or rejected.",
      desire: "To feel loved and valued.",
      weakness: "Pride — denying their own needs while over-focusing on meeting others' needs.",
      soulMessage: "You are wanted and loved for who you are, not what you do."
    },
    arrows: {
      growth: {
        type: 4,
        explanation: "Shifting to Type 4 allows you to connect with your own needs, explore your creative identity, and practice healthy self-care."
      },
      stress: {
        type: 8,
        explanation: "Shifting to Type 8 makes you uncharacteristically blunt, assertive, or demanding when you feel taken for granted."
      }
    },
    wings: {
      1: { archetype: "2w1: The Companion", influence: "Blends Type 2's helpfulness with Type 1's sense of duty and morals. They are quiet, self-critical, and focused on doing good." },
      3: { archetype: "2w3: The Host/Hostess", influence: "Blends Type 2's relational warmth with Type 3's charm and ambition. They are outgoing, image-conscious, and love hosting/supporting." }
    },
    nextSteps: {
      personalGrowth: "Learn to say 'no' without feeling guilty. Your value is not based on what you do for others.",
      relationship: "Communicate your needs directly instead of expecting others to read your mind or guess what you want.",
      career: "Choose careers where support is structured (coaching, teaching, medicine) rather than codependent environments.",
      stressManagement: "Schedule solo retreat times to check in with your own emotions and physical state.",
      dailyHabit: "Dedicate 15 minutes to a personal hobby before helping anyone else in the morning."
    }
  },
  3: {
    title: "The Achiever",
    role: "Success, image, performance, productivity",
    description: "Type Threes are self-assured, attractive, and charming. Ambitious, competent, and energetic, they can also be status-conscious and highly driven for advancement. They are diplomatic and poised, but can be overly concerned with their image.",
    keyTraits: ["Adaptable", "Excelling", "Driven", "Image-Conscious"],
    coreMotivations: {
      keyDrivers: "Striving to be productive, achieve success, stand out, and be admired by others.",
      biggestFear: "Being worthless, a failure, or inefficient.",
      coreValues: "Success, competence, efficiency, and status.",
      decisionMaking: "Pragmatic and goal-oriented. They choose the fastest, most effective route to clear, measurable success.",
      stressReactions: "Under stress, Threes move towards Type 9. They can become disengaged, passive-aggressive, and retreat into autopilot/routine.",
      securityTriggers: "When feeling secure, Threes move towards Type 6. They become cooperative, loyal, and committed to group goals and family security."
    },
    coreSummary: {
      fear: "Failure, being unmasked as incompetent or useless.",
      desire: "To feel valuable, admired, and successful.",
      weakness: "Deceit — presenting a polished image of success rather than their true, vulnerable self.",
      soulMessage: "You are loved simply for existing, not for your achievements."
    },
    arrows: {
      growth: {
        type: 6,
        explanation: "Shifting to Type 6 helps you build authentic loyalty and trust, slowing down to work collaboratively for a common goal."
      },
      stress: {
        type: 9,
        explanation: "Shifting to Type 9 makes you slow down, burn out, or become passive and disengaged under extreme pressure."
      }
    },
    wings: {
      2: { archetype: "3w2: The Charmer", influence: "Blends Type 3's ambition with Type 2's desire to please and connect. They are warm, sociable, and highly encouraging." },
      4: { archetype: "3w4: The Professional", influence: "Blends Type 3's drive with Type 4's depth and work ethic. They are serious, design-conscious, and focused on unique expertise." }
    },
    nextSteps: {
      personalGrowth: "Separate your self-worth from your to-do list. Practice just 'being' rather than always 'doing.'",
      relationship: "Share your failures and vulnerabilities; let people see the real you behind the accomplishments.",
      career: "Pursue projects aligned with your genuine passions, not just those that offer prestige or status.",
      stressManagement: "Incorporate mindfulness meditation with no goal, timer, or expectations of progress.",
      dailyHabit: "Spend 5 minutes reflecting on who you are when you aren't working or achieving."
    }
  },
  4: {
    title: "The Individualist",
    role: "Authenticity, uniqueness, depth, emotional meaning",
    description: "Type Fours are self-aware, sensitive, and reserved. They are emotionally honest, creative, and personal, but can also be moody and self-conscious. They search for meaning and authenticity in all things.",
    keyTraits: ["Expressive", "Dramatic", "Self-Absorbed", "Temperamental"],
    coreMotivations: {
      keyDrivers: "Desire to express themselves uniquely, be authentic, and create meaning out of their emotional landscape.",
      biggestFear: "Having no identity, personal significance, or being ordinary.",
      coreValues: "Authenticity, beauty, emotional depth, and individual expression.",
      decisionMaking: "Intuitive and feeling-based. They choose options that feel authentic to their identity, even if impractical.",
      stressReactions: "Under stress, Fours move towards Type 2. They can become codependent, seeking validation, and overly accommodating to secure connection.",
      securityTriggers: "When feeling secure, Fours move towards Type 1. They become organized, disciplined, objective, and translate feelings into concrete, productive work."
    },
    coreSummary: {
      fear: "Having no identity or personal significance.",
      desire: "To find themselves and their significance (to create an identity).",
      weakness: "Envy — feeling that they are uniquely flawed and that others possess the happiness they lack.",
      soulMessage: "You are seen and completely understood in your depth."
    },
    arrows: {
      growth: {
        type: 1,
        explanation: "Shifting to Type 1 brings structure, self-discipline, and helps you ground your deep feelings in practical action."
      },
      stress: {
        type: 2,
        explanation: "Shifting to Type 2 makes you seek approval, becoming people-pleasing or clingy when emotionally overwhelmed."
      }
    },
    wings: {
      3: { archetype: "4w3: The Aristocrat", influence: "Blends Type 4's depth with Type 3's drive and desire to be seen. They are expressive, elegant, and goal-driven." },
      5: { archetype: "4w5: The Free Spirit", influence: "Blends Type 4's emotions with Type 5's intellect. They are highly introspective, eccentric, quiet, and original." }
    },
    nextSteps: {
      personalGrowth: "Focus on what is present and positive, rather than what is missing in your life.",
      relationship: "Remember that others' lack of emotional depth doesn't mean they don't care about you.",
      career: "Work in creative, independent environments that offer room for self-expression and original ideas.",
      stressManagement: "Exercise to connect with your physical body when caught in intense emotional loops.",
      dailyHabit: "Write down 3 simple things you are grateful for today to counter the feeling of lack."
    }
  },
  5: {
    title: "The Investigator",
    role: "Knowledge, privacy, observation, independence",
    description: "Type Fives are alert, insightful, and curious. They are able to concentrate and focus on developing complex ideas and skills. Independent, innovative, and inventive, they can also become preoccupied with their thoughts and imaginary constructs.",
    keyTraits: ["Perceptive", "Innovative", "Secretive", "Isolated"],
    coreMotivations: {
      keyDrivers: "Desire to possess knowledge, understand the environment, conserve energy, and maintain independence.",
      biggestFear: "Being overwhelmed, helpless, incapable, or ignorant.",
      coreValues: "Knowledge, competence, autonomy, and privacy.",
      decisionMaking: "Analytical and detached. They gather extensive data, analyze it in isolation, and make logical, objective decisions.",
      stressReactions: "Under stress, Fives move towards Type 7. They can become hyperactive, scattered, superficial, and seek escape in distractions.",
      securityTriggers: "When feeling secure, Fives move towards Type 8. They become assertive, confident, protective, and take bold, physical action in the world."
    },
    coreSummary: {
      fear: "Being overwhelmed, useless, helpless, or incapable.",
      desire: "To be capable and competent.",
      weakness: "Avarice (Greed) — hoarding energy, knowledge, and time to avoid emotional dependency.",
      soulMessage: "Your needs are not a problem, and you have enough to offer."
    },
    arrows: {
      growth: {
        type: 8,
        explanation: "Shifting to Type 8 grounds you in your body, allowing you to speak up and confidently take charge."
      },
      stress: {
        type: 7,
        explanation: "Shifting to Type 7 makes you frantic, scattered, or indulgent in search of mental escape."
      }
    },
    wings: {
      4: { archetype: "5w4: The Iconoclast", influence: "Blends Type 5's intellect with Type 4's creativity and eccentricity. They are highly original, artistic, and private." },
      6: { archetype: "5w6: The Problem Solver", influence: "Blends Type 5's curiosity with Type 6's vigilance and loyalty. They are practical, detail-oriented, and collaborative." }
    },
    nextSteps: {
      personalGrowth: "Step out of observation and participate in life; share your thoughts before they are 'perfect.'",
      relationship: "Let others know when you need space, rather than just disappearing without explanation.",
      career: "Choose roles that allow independent research but involve occasional collaborative projects.",
      stressManagement: "Ground yourself physically through sports, walking, or hands-on crafts to escape head loops.",
      dailyHabit: "Reach out to one friend and share a personal feeling, not just facts or theories."
    }
  },
  6: {
    title: "The Loyalist",
    role: "Security, loyalty, vigilance, doubt",
    description: "Type Sixes are reliable, hard-working, responsible, and trustworthy. Excellent troubleshooting systems, they foresee problems and foster cooperation, but can also become defensive, evasive, and highly anxious.",
    keyTraits: ["Engaging", "Responsible", "Anxious", "Suspicious"],
    coreMotivations: {
      keyDrivers: "Desire to have security, support, and guidance; to anticipate danger and build reliable systems.",
      biggestFear: "Being without support, guidance, or abandoned in times of danger.",
      coreValues: "Loyalty, safety, trust, responsibility, and preparedness.",
      decisionMaking: "Collaborative and risk-averse. They consult experts, build consensus, and evaluate every potential threat.",
      stressReactions: "Under stress, Sixes move towards Type 3. They can become competitive, workaholic, and obsessed with project success and image.",
      securityTriggers: "When feeling secure, Sixes move towards Type 9. They become relaxed, peaceful, trusting, and accept things without constant scanning."
    },
    coreSummary: {
      fear: "Being without support or guidance; being left in chaos.",
      desire: "To have security and support.",
      weakness: "Anxiety (Doubt) — constantly questioning authority, self, and scanning for hidden threats.",
      soulMessage: "You are safe, supported, and your guidance lies within."
    },
    arrows: {
      growth: {
        type: 9,
        explanation: "Shifting to Type 9 brings calm, trust, and allows you to stop worrying and accept the present moment."
      },
      stress: {
        type: 3,
        explanation: "Shifting to Type 3 makes you competitive, anxious about performance, or hyper-focused on efficiency."
      }
    },
    wings: {
      5: { archetype: "6w5: The Defender", influence: "Blends Type 6's caution with Type 5's analytical nature. They are intellectual, independent, and highly technical." },
      7: { archetype: "6w7: The Buddy", influence: "Blends Type 6's loyalty with Type 7's friendliness. They are outgoing, humorous, and seek comfort in social networks." }
    },
    nextSteps: {
      personalGrowth: "Trust your own inner guidance instead of constantly seeking external authorities or rules.",
      relationship: "Build trust gradually; share your fears rather than testing others' loyalty.",
      career: "Look for stable companies with a clear structure, collaborative teams, and values matching your own.",
      stressManagement: "Use deep breathing and somatic exercises to soothe your nervous system when scanning for threats.",
      dailyHabit: "Take one minor risk daily without asking for anyone's advice or second opinions."
    }
  },
  7: {
    title: "The Enthusiast",
    role: "Fun, adventure, variety, optimism, freedom",
    description: "Type Sevens are extroverted, optimistic, versatile, and spontaneous. Playful, high-spirited, and practical, they can also misapply their talents, becoming over-extended, scattered, and undisciplined. They constantly seek new and exciting experiences.",
    keyTraits: ["Spontaneous", "Versatile", "Distractible", "Scattered"],
    coreMotivations: {
      keyDrivers: "Desire to maintain freedom, avoid missing out, keep choices open, and experience happiness.",
      biggestFear: "Being trapped in pain, deprivation, or boredom.",
      coreValues: "Freedom, joy, variety, optimism, and adventure.",
      decisionMaking: "Spontaneous and option-oriented. They choose the path that offers the most variety, excitement, and open doors.",
      stressReactions: "Under stress, Sevens move towards Type 1. They can become critical, rigid, opinionated, and controlling.",
      securityTriggers: "When feeling secure, Sevens move towards Type 5. They become quiet, highly focused, studious, and deeply investigate a single interest."
    },
    coreSummary: {
      fear: "Being deprived, trapped in pain, or missing out.",
      desire: "To be satisfied, happy, and have their needs met.",
      weakness: "Gluttony — a constant hunger for positive experiences, plans, and escaping painful emotions.",
      soulMessage: "You will be taken care of; your inner joy is secure."
    },
    arrows: {
      growth: {
        type: 5,
        explanation: "Shifting to Type 5 brings focus, depth, and the ability to stay with a single project or idea long-term."
      },
      stress: {
        type: 1,
        explanation: "Shifting to Type 1 makes you uncharacteristically critical, rigid, or impatient with details."
      }
    },
    wings: {
      6: { archetype: "7w6: The Entertainer", influence: "Blends Type 7's optimism with Type 6's relational loyalty. They are charming, witty, and seek secure fun." },
      8: { archetype: "7w8: The Realist", influence: "Blends Type 7's playfulness with Type 8's power and directness. They are entrepreneurial, assertive, and driven." }
    },
    nextSteps: {
      personalGrowth: "Practice staying present, even when negative or uncomfortable emotions arise. Don't rush to escape.",
      relationship: "Practice deep listening without steering the conversation to positive topics or planning the next activity.",
      career: "Choose creative, fast-paced roles but establish clear accountability systems to complete your work.",
      stressManagement: "Practice journaling to slow down your rapid thoughts and process unresolved emotions.",
      dailyHabit: "Limit your daily schedule to leave room for quiet reflection and unstructured downtime."
    }
  },
  8: {
    title: "The Challenger",
    role: "Power, control, directness, protection, confrontation",
    description: "Type Eights are self-confident, strong, and assertive. Protective, resourceful, straight-talking, and decisive, they can also be ego-centric and domineering. They feel they must control their environment.",
    keyTraits: ["Self-Confident", "Decisive", "Willful", "Confrontational"],
    coreMotivations: {
      keyDrivers: "Desire to be self-reliant, protect their loved ones, lead, and stay in control of their destiny.",
      biggestFear: "Being controlled, harmed, or vulnerable.",
      coreValues: "Strength, justice, autonomy, directness, and courage.",
      decisionMaking: "Decisive and action-oriented. They make gut-level, authoritative decisions and execute them immediately.",
      stressReactions: "Under stress, Eights move towards Type 5. They can become secretive, withdrawn, hyper-analytical, and quiet.",
      securityTriggers: "When feeling secure, Eights move towards Type 2. They become warm, open, deeply caring, and protective of others' feelings."
    },
    coreSummary: {
      fear: "Being controlled, dominated, or vulnerable.",
      desire: "To protect themselves and control their own life.",
      weakness: "Lust (Intensity) — pushing themselves and others to the limit, seeking intense stimulation and control.",
      soulMessage: "You will not be betrayed; it is safe to open your heart."
    },
    arrows: {
      growth: {
        type: 2,
        explanation: "Shifting to Type 2 allows you to express your soft, caring, and protective side, showing gentle vulnerability."
      },
      stress: {
        type: 5,
        explanation: "Shifting to Type 5 makes you withdraw, become highly private, and watchfully scan details under pressure."
      }
    },
    wings: {
      7: { archetype: "8w7: The Maverick", influence: "Blends Type 8's power with Type 7's energy and optimism. They are bold, outgoing, and highly entrepreneurial." },
      9: { archetype: "8w9: The Bear", influence: "Blends Type 8's strength with Type 9's calm. They are quiet, patient, protective, and lead with steady authority." }
    },
    nextSteps: {
      personalGrowth: "Realize that vulnerability is a form of strength, not weakness. Let your guard down with trusted friends.",
      relationship: "Practice softening your delivery; ask for others' opinions and listen before making group decisions.",
      career: "Seek leadership roles or entrepreneurial ventures where autonomy and bold execution are valued.",
      stressManagement: "Engage in vigorous physical activity or nature hikes to release accumulated body tension.",
      dailyHabit: "Stop and ask a trusted colleague for feedback on a major decision before implementing it today."
    }
  },
  9: {
    title: "The Peacemaker",
    role: "Harmony, merging, avoiding conflict, inner peace",
    description: "Type Nines are accepting, trusting, and stable. They are usually creative, optimistic, and supportive, but can also be too willing to go along with others to keep the peace. They want everything to go smoothly and without conflict.",
    keyTraits: ["Receptive", "Reassuring", "Agreeable", "Complacent"],
    coreMotivations: {
      keyDrivers: "Desire to maintain inner peace and external harmony; to avoid conflict, tension, and disruption.",
      biggestFear: "Loss of connection, fragmentation, or separation from others.",
      coreValues: "Peace, harmony, comfort, patience, and unity.",
      decisionMaking: "Deliberate and consensus-seeking. They see all points of view and take time to ensure everyone is comfortable.",
      stressReactions: "Under stress, Nines move towards Type 6. They can become anxious, hyper-vigilant, scanning for threats, and doubtful.",
      securityTriggers: "When feeling secure, Nines move towards Type 3. They become goal-directed, highly productive, organized, and take charge of their growth."
    },
    coreSummary: {
      fear: "Loss of connection, conflict, and separation.",
      desire: "To have inner stability and peace of mind.",
      weakness: "Sloth (Self-Forgetfulness) — ignoring their own desires and voices to keep the peace.",
      soulMessage: "Your presence matters, and your voice is important."
    },
    arrows: {
      growth: {
        type: 3,
        explanation: "Shifting to Type 3 helps you wake up, recognize your value, and take productive, energetic action on your goals."
      },
      stress: {
        type: 6,
        explanation: "Shifting to Type 6 makes you worry, become passive-aggressive, or obsess over worst-case scenarios."
      }
    },
    wings: {
      8: { archetype: "9w8: The Comfort Seeker", influence: "Blends Type 9's peace with Type 8's power. They are gentle but possess a strong, immovable boundary when pushed." },
      1: { archetype: "9w1: The Dreamer", influence: "Blends Type 9's harmony with Type 1's ideals. They are quiet, orderly, and highly moral." }
    },
    nextSteps: {
      personalGrowth: "Recognize that your opinion is valuable; express your preferences clearly instead of always merging with others.",
      relationship: "Understand that healthy conflict actually strengthens connections, rather than breaking them.",
      career: "Choose roles that involve mediation, counseling, or stable environments where peace-building is valued.",
      stressManagement: "Establish a daily structure to prevent slipping into procrastination or numbing comfort loops.",
      dailyHabit: "Speak up when you disagree on a small matter (e.g., where to eat dinner or what to watch) today."
    }
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

// Helper to draw visual Enneagram diagram in PDFKit
function drawPdfEnneagram(doc, centerX, centerY, radius, activeType, highlightTypes, arrowConnections, dominantWing) {
  // 1. Coordinates helper
  function getPointCoords(tNum, cx, cy, r) {
    const angleDegrees = -90 + (tNum === 9 ? 0 : tNum) * 40;
    const angleRad = (angleDegrees * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad)
    };
  }

  // 2. Draw Enneagram main outer circle
  doc.circle(centerX, centerY, radius).strokeColor('#cbd5e1').lineWidth(1.8).stroke();

  // 3. Draw Enneagram standard inner lines (triangle 3-6-9 and hexagram 1-4-2-8-5-7)
  const pts = {};
  for (let t = 1; t <= 9; t++) {
    pts[t] = getPointCoords(t, centerX, centerY, radius);
  }

  // Triangle 3-6-9
  doc.strokeColor('#e2e8f0').lineWidth(1.1).moveTo(pts[3].x, pts[3].y).lineTo(pts[6].x, pts[6].y).lineTo(pts[9].x, pts[9].y).closePath().stroke();
  // Hexagram 1-4-2-8-5-7
  doc.strokeColor('#e2e8f0').lineWidth(1.1)
     .moveTo(pts[1].x, pts[1].y)
     .lineTo(pts[4].x, pts[4].y)
     .lineTo(pts[2].x, pts[2].y)
     .lineTo(pts[8].x, pts[8].y)
     .lineTo(pts[5].x, pts[5].y)
     .lineTo(pts[7].x, pts[7].y)
     .closePath().stroke();

  // 4. Draw arrows (growth / stress)
  arrowConnections.forEach(arrow => {
    const startPt = pts[arrow.from];
    const endPt = pts[arrow.to];
    doc.strokeColor(arrow.color).lineWidth(2.8).moveTo(startPt.x, startPt.y).lineTo(endPt.x, endPt.y).stroke();
    
    // Arrowhead
    const angle = Math.atan2(endPt.y - startPt.y, endPt.x - startPt.x);
    const headLength = 7.5;
    const arrowX1 = endPt.x - headLength * Math.cos(angle - Math.PI / 6);
    const arrowY1 = endPt.y - headLength * Math.sin(angle - Math.PI / 6);
    const arrowX2 = endPt.x - headLength * Math.cos(angle + Math.PI / 6);
    const arrowY2 = endPt.y - headLength * Math.sin(angle + Math.PI / 6);
    
    doc.fillColor(arrow.color).moveTo(endPt.x, endPt.y).lineTo(arrowX1, arrowY1).lineTo(arrowX2, arrowY2).closePath().fill();
  });

  // 5. Draw wings connections (if highlightTypes is provided)
  if (highlightTypes && highlightTypes.length > 0) {
    highlightTypes.forEach(w => {
      const startPt = pts[activeType];
      const endPt = pts[w];
      const isDominant = w === dominantWing;
      const color = isDominant ? '#0d9488' : '#94a3b8';
      const width = isDominant ? 3.2 : 1.8;
      
      if (isDominant) {
        doc.strokeColor(color).lineWidth(width).moveTo(startPt.x, startPt.y).lineTo(endPt.x, endPt.y).stroke();
        doc.circle(endPt.x, endPt.y, 4.5).fillColor(color).fill();
      } else {
        doc.strokeColor(color).lineWidth(width).dash(3, { space: 3 }).moveTo(startPt.x, startPt.y).lineTo(endPt.x, endPt.y).stroke().undash();
      }
    });
  }

  // 6. Draw point labels and highlights
  for (let t = 1; t <= 9; t++) {
    const pt = getPointCoords(t, centerX, centerY, radius + 12);
    const isActive = t === activeType;
    const isHighlighted = highlightTypes && highlightTypes.includes(t);
    
    if (isActive) {
      doc.circle(pts[t].x, pts[t].y, 5).fillColor('#4f46e5').fill();
      doc.fillColor('#4f46e5').font('Helvetica-Bold').fontSize(11);
    } else if (isHighlighted) {
      const isDomWing = t === dominantWing;
      const color = isDomWing ? '#0d9488' : '#64748b';
      doc.circle(pts[t].x, pts[t].y, 4.5).fillColor(color).fill();
      doc.fillColor(color).font('Helvetica-Bold').fontSize(10);
    } else {
      doc.circle(pts[t].x, pts[t].y, 3).fillColor('#cbd5e1').fill();
      doc.fillColor('#94a3b8').font('Helvetica').fontSize(9);
    }
    
    doc.text(t.toString(), pt.x - 3, pt.y - 4.5);
  }
}

// Helper to generate a PDF report using pdfkit
function generatePdfReport(dominantType, profile, scores, answers, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // Title
      doc.fillColor('#4f46e5').fontSize(26).font('Helvetica-Bold').text('EnneaScope Personality Report', 50, doc.y, { align: 'center', width: 495 });
      doc.moveDown(0.5);
      
      // Subtitle
      doc.fillColor('#7c3aed').fontSize(14).font('Helvetica-Bold').text('Personalized Personality Archetype Report', 50, doc.y, { align: 'center', width: 495 });
      doc.moveDown(1);
      
      // Line separator
      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1.5);

      // Dominant Type Title
      doc.fillColor('#1a202c').fontSize(18).font('Helvetica-Bold').text(`Dominant Type: Type ${dominantType} — ${profile.title}`, 50, doc.y, { underline: true, width: 495 });
      doc.moveDown(0.5);
      
      doc.fillColor('#4f46e5').fontSize(12).font('Helvetica-Oblique').text(`"Core Orientation: ${profile.role}"`, 50, doc.y, { width: 495 });
      doc.moveDown(0.8);
      
      doc.fillColor('#4a5568').fontSize(12).font('Helvetica').text(profile.description, 50, doc.y, { align: 'justify', lineGap: 3, width: 495 });
      doc.moveDown(1.2);

      // Key Traits
      doc.fillColor('#1a202c').fontSize(12).font('Helvetica-Bold').text('Key Traits:', 50, doc.y, { width: 495 });
      doc.fillColor('#2d3748').fontSize(12).font('Helvetica').text(profile.keyTraits.join(', '), 50, doc.y, { width: 495 });
      doc.moveDown(1.5);

      // Core Motivations Section
      doc.fillColor('#1a202c').fontSize(14).font('Helvetica-Bold').text('1. Core Motivations', 50, doc.y, { underline: true, width: 495 });
      doc.moveDown(0.5);
      
      const motivations = [
        { label: 'Key Drivers', value: profile.coreMotivations.keyDrivers },
        { label: 'Biggest Fear', value: profile.coreMotivations.biggestFear },
        { label: 'Core Values', value: profile.coreMotivations.coreValues },
        { label: 'Decision-Making Style', value: profile.coreMotivations.decisionMaking },
        { label: 'Stress Reactions', value: profile.coreMotivations.stressReactions },
        { label: 'Security Triggers', value: profile.coreMotivations.securityTriggers }
      ];
      
      motivations.forEach(m => {
        doc.fillColor('#4a5568').fontSize(12).font('Helvetica-Bold').text(`${m.label}: `, 50, doc.y, { continued: true });
        doc.fillColor('#2d3748').font('Helvetica').text(m.value, { width: 495 });
        doc.moveDown(0.4);
      });
      doc.moveDown(1.2);

      // Core Personality Summary Section
      doc.fillColor('#1a202c').fontSize(14).font('Helvetica-Bold').text('2. Core Personality Summary', 50, doc.y, { underline: true, width: 495 });
      doc.moveDown(0.5);
      
      const summary = [
        { label: 'Core Fear', value: profile.coreSummary.fear },
        { label: 'Core Desire', value: profile.coreSummary.desire },
        { label: 'Core Weakness', value: profile.coreSummary.weakness },
        { label: 'Soul Message', value: profile.coreSummary.soulMessage }
      ];
      
      summary.forEach(s => {
        doc.fillColor('#4a5568').fontSize(12).font('Helvetica-Bold').text(`${s.label}: `, 50, doc.y, { continued: true });
        doc.fillColor('#2d3748').font('Helvetica').text(s.value, { width: 495 });
        doc.moveDown(0.4);
      });
      doc.moveDown(1.2);

      // Enneagram Arrows Section
      doc.fillColor('#1a202c').fontSize(14).font('Helvetica-Bold').text('3. Enneagram Arrows', 50, doc.y, { underline: true, width: 495 });
      doc.moveDown(0.5);
      doc.fillColor('#10b981').fontSize(12).font('Helvetica-Bold').text(`Growth Arrow (Integrates to Type ${profile.arrows.growth.type}): `, 50, doc.y, { continued: true });
      doc.fillColor('#2d3748').font('Helvetica').text(profile.arrows.growth.explanation, { width: 495 });
      doc.moveDown(0.4);
      doc.fillColor('#ef4444').font('Helvetica-Bold').text(`Stress Arrow (Disintegrates to Type ${profile.arrows.stress.type}): `, 50, doc.y, { continued: true });
      doc.fillColor('#2d3748').font('Helvetica').text(profile.arrows.stress.explanation, { width: 495 });
      doc.moveDown(1.0);

      // Draw Enneagram Arrows Diagram
      const typeNumInt = parseInt(dominantType, 10);
      if (doc.y > 560) {
        doc.addPage();
      }
      doc.moveDown(0.5);
      const cy1 = doc.y + 77;
      drawPdfEnneagram(doc, 297, cy1, 65, typeNumInt, [], [
        { from: typeNumInt, to: profile.arrows.growth.type, color: '#10b981' },
        { from: typeNumInt, to: profile.arrows.stress.type, color: '#ef4444' }
      ], null);
      doc.y = cy1 + 87; // move cursor below diagram
      doc.moveDown(1.5);

      // Wings Section
      doc.fillColor('#1a202c').fontSize(14).font('Helvetica-Bold').text('4. Your Wings', 50, doc.y, { underline: true, width: 495 });
      doc.moveDown(0.5);
      
      let wing1 = typeNumInt - 1;
      let wing2 = typeNumInt + 1;
      if (wing1 < 1) wing1 = 9;
      if (wing2 > 9) wing2 = 1;

      const score1 = parseFloat(scores[wing1] || 0);
      const score2 = parseFloat(scores[wing2] || 0);

      let dominantWing = wing1;
      if (score2 > score1) {
        dominantWing = wing2;
      }
      const wingDetails = profile.wings ? (profile.wings[dominantWing] || { archetype: 'Unknown', influence: '' }) : { archetype: 'Unknown', influence: '' };
      
      doc.fillColor('#0d9488').fontSize(12).font('Helvetica-Bold').text(`Dominant Wing Archetype: ${wingDetails.archetype}`, 50, doc.y, { width: 495 });
      doc.moveDown(0.3);
      doc.fillColor('#2d3748').fontSize(12).font('Helvetica').text(wingDetails.influence, 50, doc.y, { width: 495, align: 'justify' });
      doc.moveDown(1.0);

      // Draw Enneagram Wings Diagram
      if (doc.y > 560) {
        doc.addPage();
      }
      doc.moveDown(0.5);
      const cy2 = doc.y + 77;
      drawPdfEnneagram(doc, 297, cy2, 65, typeNumInt, [wing1, wing2], [], dominantWing);
      doc.y = cy2 + 87; // move cursor below diagram
      doc.moveDown(1.5);

      // Next Steps Section
      doc.fillColor('#1a202c').fontSize(14).font('Helvetica-Bold').text('5. What to Do Next', 50, doc.y, { underline: true, width: 495 });
      doc.moveDown(0.5);
      const nextSteps = [
        { label: 'Personal Growth', value: profile.nextSteps.personalGrowth },
        { label: 'Relationships', value: profile.nextSteps.relationship },
        { label: 'Career', value: profile.nextSteps.career },
        { label: 'Stress Management', value: profile.nextSteps.stressManagement },
        { label: 'Daily Habit', value: profile.nextSteps.dailyHabit }
      ];
      nextSteps.forEach(n => {
        doc.fillColor('#4a5568').fontSize(12).font('Helvetica-Bold').text(`${n.label}: `, 50, doc.y, { continued: true });
        doc.fillColor('#2d3748').font('Helvetica').text(n.value, { width: 495 });
        doc.moveDown(0.4);
      });

      // Conditional Page Break for Score Breakdown and Answers
      if (doc.y > 480) {
        doc.addPage();
      } else {
        doc.moveDown(1.5);
      }

      doc.fillColor('#4f46e5').fontSize(18).font('Helvetica-Bold').text('Enneagram Scoring & Question Responses', 50, doc.y, { align: 'center', width: 495 });
      doc.moveDown(1);

      // Score Breakdown
      doc.fillColor('#1a202c').fontSize(14).font('Helvetica-Bold').text('Score Breakdown', 50, doc.y, { underline: true, width: 495 });
      doc.moveDown(0.5);

      // Draw table for scores
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#4a5568');
      const headerY = doc.y;
      doc.text('Enneagram Type', 50, headerY, { width: 220 });
      doc.text('Average Rating', 270, headerY, { width: 120, align: 'center' });
      doc.text('Match Score', 390, headerY, { width: 155, align: 'right' });
      doc.moveDown(0.3);

      // Draw line
      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.4);

      doc.font('Helvetica').fillColor('#2d3748');
      Object.entries(scores).forEach(([typeNum, score]) => {
        const typeProfile = TYPE_PROFILES[typeNum] || { title: `Type ${typeNum}` };
        const percentage = Math.round(score * 20);
        const isDominant = parseInt(typeNum, 10) === parseInt(dominantType, 10);
        
        if (isDominant) {
          doc.font('Helvetica-Bold').fillColor('#4f46e5');
        } else {
          doc.font('Helvetica').fillColor('#2d3748');
        }

        const rowY = doc.y;
        doc.text(`Type ${typeNum} — ${typeProfile.title}`, 50, rowY, { width: 220 });
        doc.text(`${parseFloat(score).toFixed(2)} / 5.00`, 270, rowY, { width: 120, align: 'center' });
        doc.text(`${percentage}%`, 390, rowY, { width: 155, align: 'right' });
        doc.moveDown(1.2);
      });
      // Questionnaire Responses
      doc.addPage();
      doc.fillColor('#1a202c').fontSize(14).font('Helvetica-Bold').text('Questionnaire Responses Breakdown', 50, doc.y, { align: 'center', width: 495 });
      doc.moveDown(1.0);
      
      const drawTableHeader = () => {
        const headerY = doc.y;
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#4a5568');
        doc.text('Q#', 50, headerY, { width: 30 });
        doc.text('Question Statement', 85, headerY, { width: 260 });
        doc.text('Category', 355, headerY, { width: 120 });
        doc.text('Response', 485, headerY, { width: 60, align: 'right' });
        doc.moveDown(0.3);
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.4);
      };

      drawTableHeader();

      answers.forEach((ans, idx) => {
        const isScenario = ans.typeNumber === null || typeof ans.rating === 'string';
        const typeProfile = isScenario ? { title: 'Culinary Motivation' } : (TYPE_PROFILES[ans.typeNumber] || { title: `Type ${ans.typeNumber}` });
        const categoryText = isScenario ? 'Culinary Scenario' : `Type ${ans.typeNumber} (${typeProfile.title})`;
        const ratingText = isScenario ? `Option ${ans.rating}` : `${ans.rating} / 5`;
        
        // Estimate row height: question text length
        const textHeight = doc.heightOfString(ans.text, { width: 260, fontSize: 12, font: 'Helvetica' });
        const rowHeight = Math.max(textHeight, 15) + 12;
        
        if (doc.y + rowHeight > 740) {
          doc.addPage();
          drawTableHeader();
        }
        
        const rowY = doc.y;
        doc.fontSize(12).font('Helvetica').fillColor('#2d3748');
        
        // Q#
        doc.text((idx + 1).toString(), 50, rowY, { width: 30 });
        // Question Statement
        doc.text(ans.text, 85, rowY, { width: 260 });
        // Category
        doc.text(categoryText, 355, rowY, { width: 120 });
        // Response
        if (isScenario) {
          doc.font('Helvetica-Bold').fillColor('#4f46e5');
        } else if (ans.rating >= 4) {
          doc.font('Helvetica-Bold').fillColor('#10b981');
        } else if (ans.rating <= 2) {
          doc.font('Helvetica-Bold').fillColor('#ef4444');
        } else {
          doc.font('Helvetica').fillColor('#2d3748');
        }
        doc.text(ratingText, 485, rowY, { width: 60, align: 'right' });
        
        // Explicitly advance doc.y to the bottom of the row
        doc.y = rowY + rowHeight;
        
        // Draw a light line between rows
        doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.y += 6;
      });

      // Footer pagination
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        
        // Temporarily set bottom margin to 0 to prevent automatic page breaks when drawing footer near the bottom
        const oldBottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;

        doc.fontSize(8).font('Helvetica').fillColor('#94a3b8').text(
          `Generated by EnneaScope | Page ${i + 1} of ${pages.count}`,
          50,
          doc.page.height - 40,
          { align: 'center', width: doc.page.width - 100 }
        );

        // Restore bottom margin
        doc.page.margins.bottom = oldBottomMargin;
      }

      doc.end();

      writeStream.on('finish', () => {
        resolve();
      });
      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

// Endpoint to send the report email
app.post('/api/send-report', async (req, res) => {
  const { email, scores, dominantType, answers } = req.body;

  if (!email || !scores || !dominantType) {
    return res.status(400).json({ success: false, message: 'Missing required parameters.' });
  }

  // Find dominant profile details
  const profile = TYPE_PROFILES[dominantType] || { title: `Type ${dominantType}`, role: 'Unknown', description: '', keyTraits: [] };

  // Calculate dominant wing dynamically on the server
  const typeNumInt = parseInt(dominantType, 10);
  let wing1 = typeNumInt - 1;
  let wing2 = typeNumInt + 1;
  if (wing1 < 1) wing1 = 9;
  if (wing2 > 9) wing2 = 1;

  const score1 = parseFloat(scores[wing1] || 0);
  const score2 = parseFloat(scores[wing2] || 0);

  let dominantWing = wing1;
  if (score2 > score1) {
    dominantWing = wing2;
  }
  const wingDetails = profile.wings ? (profile.wings[dominantWing] || { archetype: 'Unknown', influence: '' }) : { archetype: 'Unknown', influence: '' };

  // Create formatted report sections for fallback HTML
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
      const isScenario = ans.typeNumber === null || typeof ans.rating === 'string';
      const typeProfile = isScenario ? { title: 'Culinary Motivation' } : (TYPE_PROFILES[ans.typeNumber] || { title: `Type ${ans.typeNumber}` });
      const categoryText = isScenario ? 'Culinary Motivation Scenario' : `Type ${ans.typeNumber} (${typeProfile.title})`;
      const ratingText = isScenario ? `Option ${ans.rating}` : `${ans.rating} / 5`;
      return `
        <div style="padding: 10px; border-bottom: 1px solid #edf2f7; margin-bottom: 5px;">
          <p style="margin: 0; font-size: 14px; color: #4a5568;"><strong>Q${idx + 1}:</strong> ${ans.text}</p>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #718096;">
            Category: <strong>${categoryText}</strong> | 
            Your Response: <strong style="color: #4f46e5;">${ratingText}</strong>
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
          <!-- 1. Overview -->
          <h2 style="font-size: 22px; color: #1a202c; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 0;">Your Dominant Type: Type ${dominantType} &mdash; ${profile.title}</h2>
          <p style="font-style: italic; color: #4f46e5; font-weight: 600; font-size: 16px; margin: 10px 0;">
            "Core Orientation: ${profile.role}"
          </p>
          <p style="font-size: 15px; color: #4a5568;">
            ${profile.description}
          </p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f7fafc; border-left: 4px solid #4f46e5; border-radius: 0 8px 8px 0;">
            <strong style="display: block; margin-bottom: 5px; font-size: 13px; text-transform: uppercase; color: #718096; letter-spacing: 0.5px;">Key Traits:</strong>
            <span style="font-size: 15px; font-weight: 500; color: #2d3748;">
              ${profile.keyTraits.join(', ')}
            </span>
          </div>

          <!-- 2. Your Core Motivations -->
          <h3 style="font-size: 18px; color: #1a202c; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 30px;">Your Core Motivations</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 35%; color: #4a5568; vertical-align: top;">Key Drivers:</td>
              <td style="padding: 8px 0; color: #2d3748;">${profile.coreMotivations.keyDrivers}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568; vertical-align: top;">Biggest Fear:</td>
              <td style="padding: 8px 0; color: #2d3748;">${profile.coreMotivations.biggestFear}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568; vertical-align: top;">Core Values:</td>
              <td style="padding: 8px 0; color: #2d3748;">${profile.coreMotivations.coreValues}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568; vertical-align: top;">Decision-Making Style:</td>
              <td style="padding: 8px 0; color: #2d3748;">${profile.coreMotivations.decisionMaking}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568; vertical-align: top;">Stress Reactions:</td>
              <td style="padding: 8px 0; color: #2d3748;">${profile.coreMotivations.stressReactions}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568; vertical-align: top;">Security Triggers:</td>
              <td style="padding: 8px 0; color: #2d3748;">${profile.coreMotivations.securityTriggers}</td>
            </tr>
          </table>

          <!-- 3. Core Personality Summary -->
          <h3 style="font-size: 18px; color: #1a202c; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 30px;">Core Personality Summary</h3>
          <div style="margin-top: 15px;">
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
              <strong style="color: #ef4444; font-size: 13px; text-transform: uppercase;">Core Fear</strong>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #2d3748;">${profile.coreSummary.fear}</p>
            </div>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
              <strong style="color: #22c55e; font-size: 13px; text-transform: uppercase;">Core Desire</strong>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #2d3748;">${profile.coreSummary.desire}</p>
            </div>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
              <strong style="color: #f59e0b; font-size: 13px; text-transform: uppercase;">Core Weakness</strong>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #2d3748;">${profile.coreSummary.weakness}</p>
            </div>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
              <strong style="color: #6366f1; font-size: 13px; text-transform: uppercase;">Soul Message</strong>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #2d3748;">${profile.coreSummary.soulMessage}</p>
            </div>
          </div>

          <!-- 4. Your Enneagram Arrows -->
          <h3 style="font-size: 18px; color: #1a202c; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 30px;">Your Enneagram Arrows</h3>
          <div style="margin-top: 15px;">
            <div style="border-left: 4px solid #10b981; padding-left: 15px; margin-bottom: 15px;">
              <strong style="color: #10b981; font-size: 14px;">Growth Arrow (Integrates to Type ${profile.arrows.growth.type})</strong>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #4a5568;">${profile.arrows.growth.explanation}</p>
            </div>
            <div style="border-left: 4px solid #ef4444; padding-left: 15px; margin-bottom: 15px;">
              <strong style="color: #ef4444; font-size: 14px;">Stress Arrow (Disintegrates to Type ${profile.arrows.stress.type})</strong>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #4a5568;">${profile.arrows.stress.explanation}</p>
            </div>
          </div>

          <!-- 5. Your Wings -->
          <h3 style="font-size: 18px; color: #1a202c; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 30px;">Your Wings</h3>
          <div style="background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 15px; border-radius: 0 8px 8px 0; margin-top: 15px;">
            <strong style="color: #0d9488; font-size: 15px;">Dominant Wing Archetype: ${wingDetails.archetype}</strong>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #2d3748; line-height: 1.5;">${wingDetails.influence}</p>
          </div>

          <!-- 6. What to Do Next -->
          <h3 style="font-size: 18px; color: #1a202c; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 30px;">What to Do Next</h3>
          <div style="margin-top: 15px; font-size: 14px;">
            <p style="margin: 5px 0 10px 0;"><strong>🌱 Personal Growth:</strong> ${profile.nextSteps.personalGrowth}</p>
            <p style="margin: 5px 0 10px 0;"><strong>🤝 Relationships:</strong> ${profile.nextSteps.relationship}</p>
            <p style="margin: 5px 0 10px 0;"><strong>💼 Career:</strong> ${profile.nextSteps.career}</p>
            <p style="margin: 5px 0 10px 0;"><strong>🧘 Stress Management:</strong> ${profile.nextSteps.stressManagement}</p>
            <p style="margin: 5px 0 10px 0;"><strong>⏰ Daily Habit:</strong> ${profile.nextSteps.dailyHabit}</p>
          </div>

          <!-- Score Breakdown -->
          <h3 style="margin-top: 30px; font-size: 18px; color: #1a202c; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Score Breakdown</h3>
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

  // Get Brevo API Key
  const brevoApiKey = (process.env.BREVO_API_KEY || process.env.SMTP_PASS || '').trim();
  const useApi = !!brevoApiKey;

  // Create reports folder if not exists
  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  const timestamp = Date.now();
  const reportFilename = `report_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.html`;
  const reportPath = path.join(reportsDir, reportFilename);
  fs.writeFileSync(reportPath, emailHtml, 'utf-8');

  // Generate PDF report
  const pdfFilename = `report_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;
  const pdfPath = path.join(reportsDir, pdfFilename);
  
  try {
    await generatePdfReport(dominantType, profile, scores, answers, pdfPath);
    console.log(`[PDF Success] PDF report saved to local backup: ${pdfPath}`);
  } catch (pdfErr) {
    console.error('❌ Error generating PDF report:', pdfErr);
    return res.status(500).json({
      success: false,
      message: `Failed to generate PDF: ${pdfErr.message}`,
      savedLocal: false
    });
  }

  if (useApi) {
    const fromEnv = process.env.EMAIL_FROM || '"Enneagram Dashboard" <no-reply@example.com>';
    let senderName = 'Enneagram Dashboard';
    let senderEmail = 'no-reply@example.com';
    
    const fromMatch = fromEnv.match(/"?([^"<]+)"?\s*<([^>]+)>/);
    if (fromMatch) {
      senderName = fromMatch[1].trim();
      senderEmail = fromMatch[2].trim();
    } else {
      senderEmail = fromEnv.trim();
    }

    console.log(`[Email Request] Attempting to send real email via Brevo REST API...`);
    console.log(`[Email Request] To: ${email}`);
    console.log(`[Email Request] From: "${senderName}" <${senderEmail}>`);
    console.log(`[Email Request] Report PDF saved to local backup: ${pdfPath}`);
    
    try {
      const pdfBuffer = fs.readFileSync(pdfPath);
      const pdfBase64 = pdfBuffer.toString('base64');

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: senderName,
            email: senderEmail
          },
          to: [
            {
              email: email,
              name: email.split('@')[0]
            }
          ],
          subject: `Your Enneagram Personality Report: Type ${dominantType} — ${profile.title}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 22px;">Your Enneagram Report is Ready</h1>
              </div>
              <div style="padding: 20px;">
                <p>Hello,</p>
                <p>Thank you for taking the Enneagram Personality Assessment. We have completed your analysis.</p>
                <h2 style="color: #4f46e5; margin-top: 20px;">Your Dominant Type: Type ${dominantType} — ${profile.title}</h2>
                <p style="font-style: italic; color: #666; font-size: 15px;">"Core Orientation: ${profile.role}"</p>
                <p>${profile.description}</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f7fafc; border-left: 4px solid #4f46e5; border-radius: 0 8px 8px 0;">
                  <strong>Key Traits:</strong> ${profile.keyTraits.join(', ')}
                </div>
                <p><strong>Note:</strong> We have attached your full Enneagram assessment report as a <strong>PDF document</strong> to this email. The PDF contains all complex diagnostic details, core motivations, summary breakdown, wings, stress/growth arrows, and customized next steps for your personal growth.</p>
              </div>
              <div style="background-color: #f7fafc; padding: 15px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd;">
                &copy; ${new Date().getFullYear()} Enneagram Projects. All rights reserved.
              </div>
            </div>
          `,
          attachment: [
            {
              name: `Enneagram_Report_Type_${dominantType}.pdf`,
              content: pdfBase64
            }
          ]
        })
      });

      const responseBody = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(responseBody.message || `HTTP error ${response.status}`);
      }

      console.log(`[Email Success] Email successfully sent to ${email} (Message ID: ${responseBody.messageId || 'N/A'})`);
      return res.json({
        success: true,
        message: 'Report sent successfully via email with PDF attachment!',
        savedLocal: true,
        localFile: pdfFilename
      });
    } catch (err) {
      console.error('❌ Error sending real email via Brevo REST API:', err);
      return res.status(500).json({
        success: false,
        message: `Failed to send email: ${err.message}`,
        savedLocal: true,
        localFile: pdfFilename,
        error: err.message
      });
    }
  } else {
    // Return mock success with instructions
    console.log(`[Mock Mode] Email sending skipped (Brevo API key not configured).`);
    console.log(`[Mock Mode] To: ${email}`);
    console.log(`[Mock Mode] Report PDF saved to: ${pdfPath}`);
    
    return res.json({
      success: true,
      message: `Report generated successfully! Saved PDF locally as reports/${pdfFilename}`,
      savedLocal: true,
      localFile: pdfFilename,
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
  
  const brevoApiKey = (process.env.BREVO_API_KEY || process.env.SMTP_PASS || '').trim();
  const useApi = !!brevoApiKey;
  
  if (useApi) {
    console.log(`Email API Status: ENABLED (Brevo REST API)`);
    console.log(`Sender Email:     ${process.env.EMAIL_FROM || 'no-reply@example.com'}`);
  } else {
    console.log(`Email API Status: DISABLED (Running in local Mock Mode)`);
    console.log(`Missing variables: BREVO_API_KEY (or SMTP_PASS)`);
  }
  console.log(`==================================================`);
});
