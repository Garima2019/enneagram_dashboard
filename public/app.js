// Enneagram Dashboard Application State
const state = {
  allQuestionsByType: null, // Full questions library grouped by type
  baselineQuestions: [],    // The questions selected for Stage 1
  deepDiveQuestions: [],    // The deep-dive questions injected for Stage 3
  topTypes: [],             // Highest scoring types from Stage 2
  answers: {},              // Store answers: { questionNumber: rating }
  chartInstance: null,      // Chart.js chart reference
  activeChartType: 'radar', // 'radar' or 'bar'
  currentStep: 1,           // Active wizard step: 1 (Baseline), 2 (Deep Dive), 3 (Results)
  consentAgreed: false,     // GDPR consent
  currentBaselineIndex: 0,  // Active baseline question index (0-35)
  currentDeepDiveIndex: 0,  // Active deep dive question index (0-4)
  baselineValidationMode: false, // Flag when in baseline skipped questions loop
  deepDiveValidationMode: false, // Flag when in deep dive skipped questions loop
  lastGeneratedReportHtml: null // Cached report html for local download
};

// Hardcoded Culinary Motivation Scenario Question
const SCENARIO_QUESTION = {
  originalNumber: 999,
  text: "Taste and Flavors Motivation: Select the statement that best describes your relationship with food, culinary experiences, and tastes:",
  options: [
    { value: 'A', type: 1, label: "A. I seek culinary perfection, clean ingredients, and balanced flavors prepared exactly right." },
    { value: 'B', type: 2, label: "B. I enjoy sharing delicious food that brings people together and makes others feel nurtured and cared for." },
    { value: 'C', type: 3, label: "C. I appreciate high-presentation, trendy, or award-winning dishes that showcase culinary excellence and success." },
    { value: 'D', type: 4, label: "D. I crave unique, rare, and deeply expressive flavors that evoke authentic emotions and individual memories." },
    { value: 'E', type: 5, label: "E. I prefer to understand the origin, history, chemistry, and complex preparation methods of the dishes I consume." },
    { value: 'F', type: 6, label: "F. I stick to familiar, comforting recipes and trusted ingredients that guarantee a safe, reliable, and consistent dining experience." },
    { value: 'G', type: 7, label: "G. I love trying exotic, adventurous, and brand new foods in exciting, diverse combinations just for the fun of it." },
    { value: 'H', type: 8, label: "H. I desire rich, bold, intense, and hearty dishes that give me energy and a strong feeling of satisfaction." },
    { value: 'I', type: 9, label: "I. I prefer simple, peaceful, and comforting meals that create harmony and ease, enjoying whatever is served without fuss." }
  ]
};

// Enneagram Type Profiles for instant frontend rendering
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

// Client-side markdown parser fallback
function parseMarkdownClient(mdText) {
  const lines = mdText.split('\n');
  const types = {};
  let currentTypeNum = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const typeHeaderMatch = line.match(/^##\s+TYPE\s+(\d+)\s*[-—–]\s*(.*)$/i);
    if (typeHeaderMatch) {
      currentTypeNum = parseInt(typeHeaderMatch[1], 10);
      types[currentTypeNum] = {
        typeNumber: currentTypeNum,
        typeName: typeHeaderMatch[2].trim(),
        coreOrientation: '',
        questions: []
      };
      continue;
    }

    const coreMatch = line.match(/^\*Core orientation:\s*(.*)\*$/i);
    if (coreMatch && currentTypeNum) {
      types[currentTypeNum].coreOrientation = coreMatch[1].trim();
      continue;
    }

    const questionMatch = line.match(/^(\d+)\.\s*(.*)$/);
    if (questionMatch && currentTypeNum) {
      const originalNum = parseInt(questionMatch[1], 10);
      let text = questionMatch[2].trim();
      text = text.replace(/^(Statement\s+\d+[\s.:-]*|\bStatement\b[\s.:-]*)/i, '').trim();

      // Filter out non-Likert placeholder/scenario questions from library
      if (text.includes('(scenario question)') || text.includes('(seek compromise')) {
        continue;
      }

      types[currentTypeNum].questions.push({
        originalNumber: originalNum,
        text: text
      });
    }
  }
  return types;
}

// App Initialization
document.addEventListener('DOMContentLoaded', async () => {
  initializeTheme();
  await loadQuestionnaire();
  setupEventListeners();
  
  // Re-run lucide icons replacement
  lucide.createIcons();
});

// Theme Toggle Code
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

// Save Assessment Progress to LocalStorage
function saveProgress() {
  const progress = {
    consentAgreed: state.consentAgreed,
    currentBaselineIndex: state.currentBaselineIndex,
    currentDeepDiveIndex: state.currentDeepDiveIndex,
    answers: state.answers,
    baselineQuestions: state.baselineQuestions,
    deepDiveQuestions: state.deepDiveQuestions,
    topTypes: state.topTypes,
    currentStep: state.currentStep,
    baselineValidationMode: state.baselineValidationMode,
    deepDiveValidationMode: state.deepDiveValidationMode
  };
  localStorage.setItem('enneagram_progress', JSON.stringify(progress));
}

// Clear Saved Progress from LocalStorage
function clearProgress() {
  localStorage.removeItem('enneagram_progress');
}

// Restore Progress from LocalStorage
function restoreProgress() {
  const saved = localStorage.getItem('enneagram_progress');
  if (!saved) return false;

  try {
    const progress = JSON.parse(saved);
    
    state.consentAgreed = progress.consentAgreed || false;
    if (!state.consentAgreed) return false;

    if (!progress.baselineQuestions || progress.baselineQuestions.length === 0) return false;

    // Restore state properties
    state.answers = progress.answers || {};
    state.baselineQuestions = progress.baselineQuestions;
    state.deepDiveQuestions = progress.deepDiveQuestions || [];
    state.topTypes = progress.topTypes || [];
    state.currentStep = progress.currentStep || 1;
    state.currentBaselineIndex = progress.currentBaselineIndex || 0;
    state.currentDeepDiveIndex = progress.currentDeepDiveIndex || 0;
    state.baselineValidationMode = progress.baselineValidationMode || false;
    state.deepDiveValidationMode = progress.deepDiveValidationMode || false;

    // Show wizard since consent is already agreed
    document.getElementById('wizard-steps-nav').style.display = 'flex';
    updateWizardNavigation();

    if (state.currentStep === 1) {
      renderBaselineQuestions();
      updateProgress('baseline');
      showPanel('baseline-stage');
      showToast('Resumed your previous assessment progress!', 'success');
    } else if (state.currentStep === 2) {
      if (state.deepDiveQuestions.length === 0) {
        // Go back to baseline results analysis
        state.currentStep = 1;
        handleBaselineSubmit();
      } else {
        renderDeepDiveQuestions();
        updateProgress('deep-dive');
        showPanel('deep-dive-stage');
        showToast('Resumed your deep-dive questions!', 'success');
      }
    } else if (state.currentStep === 3) {
      renderResults();
      showPanel('results-stage');
      showToast('Loaded your completed results!', 'success');
    }
    return true;
  } catch (err) {
    console.error('Error restoring progress from localStorage:', err);
    clearProgress();
    return false;
  }
}

// Load Questionnaire Data
async function loadQuestionnaire() {
  showPanel('loading-screen');
  try {
    // Try hitting local express API first
    const response = await fetch(`${window.location.origin}/api/questions`);
    if (!response.ok) throw new Error('Express API failed');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    state.allQuestionsByType = result.data;
  } catch (error) {
    console.warn('API fetch failed, falling back to reading markdown file directly from root...', error);
    try {
      // Direct file fallback (if running statically via file:// or another static server)
      const mdResponse = await fetch(`${window.location.origin}/Enneagram_Questionnaire_By_Type.md`);
      if (!mdResponse.ok) throw new Error('Failed to fetch markdown file.');
      const mdText = await mdResponse.text();
      state.allQuestionsByType = parseMarkdownClient(mdText);
    } catch (fallbackError) {
      console.error('Fatal: Failed to load questionnaire.', fallbackError);
      showToast('Error loading questions. Please ensure the files are in place.', 'error');
      return;
    }
  }
  
  // Attempt to restore progress first, if none exists show consent screen
  if (!restoreProgress()) {
    showConsentScreen();
  }
}

// Show GDPR Privacy Consent Screen
function showConsentScreen() {
  document.getElementById('wizard-steps-nav').style.display = 'none';
  showPanel('consent-stage');

  const checkbox = document.getElementById('consent-checkbox');
  const proceedBtn = document.getElementById('consent-proceed-btn');
  const form = document.getElementById('consent-form');

  checkbox.checked = false;
  proceedBtn.disabled = true;

  checkbox.addEventListener('change', (e) => {
    proceedBtn.disabled = !e.target.checked;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (checkbox.checked) {
      state.consentAgreed = true;
      saveProgress();
      document.getElementById('wizard-steps-nav').style.display = 'flex';
      startAssessment();
    }
  });
}

// Clear all progress and return to consent screen cleanly
function restartAssessment() {
  clearProgress();
  state.consentAgreed = false;
  state.answers = {};
  state.baselineQuestions = [];
  state.deepDiveQuestions = [];
  state.topTypes = [];
  state.currentStep = 1;
  state.currentBaselineIndex = 0;
  state.currentDeepDiveIndex = 0;
  state.baselineValidationMode = false;
  state.deepDiveValidationMode = false;
  state.lastGeneratedReportHtml = null;

  updateWizardNavigation();
  
  // Hide wizard steps navigation bar
  document.getElementById('wizard-steps-nav').style.display = 'none';

  // Reset consent checkbox and proceed button
  const checkbox = document.getElementById('consent-checkbox');
  if (checkbox) checkbox.checked = false;
  
  const proceedBtn = document.getElementById('consent-proceed-btn');
  if (proceedBtn) proceedBtn.disabled = true;

  // Reset email input and status message
  const emailInput = document.getElementById('user-email');
  if (emailInput) emailInput.value = '';
  
  const statusEl = document.getElementById('report-status');
  if (statusEl) {
    statusEl.textContent = '';
    statusEl.className = 'status-msg';
  }

  showPanel('consent-stage');
  showToast('Assessment reset. Please accept consent to start again.', 'success');
}

// Start/Restart fresh Assessment
function startAssessment() {
  clearProgress();
  state.answers = {};
  state.baselineQuestions = [];
  state.deepDiveQuestions = [];
  state.topTypes = [];
  state.currentStep = 1;
  state.consentAgreed = true;
  state.currentBaselineIndex = 0;
  state.currentDeepDiveIndex = 0;
  state.baselineValidationMode = false;
  state.deepDiveValidationMode = false;
  state.lastGeneratedReportHtml = null;
  
  updateWizardNavigation();

  // Select 4 random questions for each of the 9 types (36 questions total)
  for (let typeNum = 1; typeNum <= 9; typeNum++) {
    const typeObj = state.allQuestionsByType[typeNum];
    if (!typeObj || !typeObj.questions || typeObj.questions.length < 4) {
      console.error(`Insufficient questions for Type ${typeNum}`);
      continue;
    }
    
    // Choose 4 unique random questions
    const questions = [...typeObj.questions];
    for (let i = 0; i < 4; i++) {
      const idx = Math.floor(Math.random() * questions.length);
      const q = questions.splice(idx, 1)[0];
      state.baselineQuestions.push({
        ...q,
        typeNumber: typeNum
      });
    }
  }

  // Inject the new taste and flavors motivation scenario question directly as a hardcoded core baseline item
  state.baselineQuestions.push({
    originalNumber: SCENARIO_QUESTION.originalNumber,
    text: SCENARIO_QUESTION.text,
    typeNumber: null,
    isScenario: true,
    options: SCENARIO_QUESTION.options
  });

  // Shuffle baseline questions to mix up types
  shuffleArray(state.baselineQuestions);

  // Render Baseline form
  renderBaselineQuestions();
  updateProgress('baseline');
  showPanel('baseline-stage');
}

// Setup Event Listeners
function setupEventListeners() {
  // Stage 1 Baseline Form Submit
  const baselineForm = document.getElementById('baseline-form');
  baselineForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.currentBaselineIndex === state.baselineQuestions.length - 1) {
      const hasUnanswered = state.baselineQuestions.some(q => state.answers[q.originalNumber] === undefined);
      if (hasUnanswered) {
        validateBaselineAnswers();
      } else {
        handleBaselineSubmit();
      }
    }
  });

  // Baseline Back Navigation
  const baselineBackBtn = document.getElementById('baseline-back-btn');
  baselineBackBtn.addEventListener('click', () => {
    if (state.currentBaselineIndex > 0) {
      state.currentBaselineIndex--;
      saveProgress();
      renderBaselineQuestions();
    }
  });

  // Baseline Next/Calculate Navigation
  const baselineNextBtn = document.getElementById('baseline-next-btn');
  baselineNextBtn.addEventListener('click', () => {
    if (state.baselineValidationMode) {
      const nextIndex = findNextUnansweredBaselineIndex(state.currentBaselineIndex);
      if (nextIndex !== -1) {
        state.currentBaselineIndex = nextIndex;
        saveProgress();
        renderBaselineQuestions();
      } else {
        state.baselineValidationMode = false;
        const errorEl = document.getElementById('baseline-error');
        if (errorEl) errorEl.style.display = 'none';
        handleBaselineSubmit();
      }
    } else {
      if (state.currentBaselineIndex < state.baselineQuestions.length - 1) {
        state.currentBaselineIndex++;
        saveProgress();
        renderBaselineQuestions();
      } else {
        const hasUnanswered = state.baselineQuestions.some(q => state.answers[q.originalNumber] === undefined);
        if (hasUnanswered) {
          validateBaselineAnswers();
        } else {
          handleBaselineSubmit();
        }
      }
    }
  });

  // Proceed from transition to Deep Dive
  const startDeepDiveBtn = document.getElementById('start-deep-dive-btn');
  startDeepDiveBtn.addEventListener('click', () => {
    state.currentStep = 2;
    state.currentDeepDiveIndex = 0;
    updateWizardNavigation();
    renderDeepDiveQuestions();
    updateProgress('deep-dive');
    showPanel('deep-dive-stage');
  });

  // Stage 3 Deep Dive Form Submit
  const deepDiveForm = document.getElementById('deep-dive-form');
  deepDiveForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.currentDeepDiveIndex === state.deepDiveQuestions.length - 1) {
      const hasUnanswered = state.deepDiveQuestions.some(q => state.answers[q.originalNumber] === undefined);
      if (hasUnanswered) {
        validateDeepDiveAnswers();
      } else {
        handleDeepDiveSubmit();
      }
    }
  });

  // Deep Dive Back Navigation
  const deepDiveBackBtn = document.getElementById('deep-dive-back-btn');
  deepDiveBackBtn.addEventListener('click', () => {
    if (state.currentDeepDiveIndex > 0) {
      state.currentDeepDiveIndex--;
      saveProgress();
      renderDeepDiveQuestions();
    }
  });

  // Deep Dive Next/Submit Navigation
  const deepDiveNextBtn = document.getElementById('deep-dive-next-btn');
  deepDiveNextBtn.addEventListener('click', () => {
    if (state.deepDiveValidationMode) {
      const nextIndex = findNextUnansweredDeepDiveIndex(state.currentDeepDiveIndex);
      if (nextIndex !== -1) {
        state.currentDeepDiveIndex = nextIndex;
        saveProgress();
        renderDeepDiveQuestions();
      } else {
        state.deepDiveValidationMode = false;
        const errorEl = document.getElementById('deep-dive-error');
        if (errorEl) errorEl.style.display = 'none';
        handleDeepDiveSubmit();
      }
    } else {
      const isLast = state.currentDeepDiveIndex === state.deepDiveQuestions.length - 1;
      if (!isLast) {
        state.currentDeepDiveIndex++;
        saveProgress();
        renderDeepDiveQuestions();
      } else {
        const hasUnanswered = state.deepDiveQuestions.some(q => state.answers[q.originalNumber] === undefined);
        if (hasUnanswered) {
          validateDeepDiveAnswers();
        } else {
          handleDeepDiveSubmit();
        }
      }
    }
  });

  // Email Report Submission
  const emailForm = document.getElementById('email-report-form');
  emailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendEmailReport();
  });

  // Chart Toggle Buttons
  document.getElementById('btn-chart-radar').addEventListener('click', () => {
    toggleChartType('radar');
  });
  document.getElementById('btn-chart-bar').addEventListener('click', () => {
    toggleChartType('bar');
  });

  // Restart Button
  document.getElementById('btn-restart').addEventListener('click', () => {
    if (confirm('Are you sure you want to restart the assessment? Your answers will be lost.')) {
      restartAssessment();
    }
  });



  // Answers Accordion Toggle
  const accordionHeader = document.getElementById('btn-toggle-answers');
  const accordionContent = document.getElementById('answers-accordion-content');
  accordionHeader.addEventListener('click', () => {
    accordionHeader.classList.toggle('active');
    accordionContent.classList.toggle('open');
  });
}

// Render Active Baseline Question (1-18)
function renderBaselineQuestions() {
  const container = document.getElementById('baseline-questions-container');
  container.innerHTML = '';

  const index = state.currentBaselineIndex;
  const q = state.baselineQuestions[index];
  if (!q) return;

  const card = createQuestionCard(q, index + 1, 'baseline');
  container.innerHTML = card;

  // Trigger slide-in entry animation
  const cardElement = container.querySelector('.question-card');
  if (cardElement) {
    cardElement.classList.add('fade-in-slide');
  }

  // Add click listeners to custom radios to update progress bar dynamically
  attachRadioListeners('baseline');
  updateBaselineNavButtons();
}

// Render Active Deep Dive Question
function renderDeepDiveQuestions() {
  const container = document.getElementById('deep-dive-questions-container');
  container.innerHTML = '';
  
  // Update description header with types
  const typesText = state.topTypes.map(t => `Type ${t} (${TYPE_PROFILES[t].title})`).join(' and ');
  document.getElementById('deep-dive-description').innerHTML = 
    `We have dynamically injected ${state.deepDiveQuestions.length} additional sequential questions exclusive to <strong>${typesText}</strong> from the questionnaire file to verify your profile structure.`;

  const index = state.currentDeepDiveIndex;
  const q = state.deepDiveQuestions[index];
  if (!q) return;

  // Number them from 37 onwards
  const card = createQuestionCard(q, index + 37, 'deepdive');
  container.innerHTML = card;

  // Trigger slide-in entry animation
  const cardElement = container.querySelector('.question-card');
  if (cardElement) {
    cardElement.classList.add('fade-in-slide');
  }

  attachRadioListeners('deep-dive');
  updateDeepDiveNavButtons();
}

// Update Baseline back/next navigation button states
function updateBaselineNavButtons() {
  const backBtn = document.getElementById('baseline-back-btn');
  const nextBtn = document.getElementById('baseline-next-btn');
  const errorEl = document.getElementById('baseline-error');

  if (errorEl) errorEl.style.display = 'none';

  // Toggle Back button active state
  backBtn.disabled = (state.currentBaselineIndex === 0);

  // Next button is always visible so they can skip questions manually
  nextBtn.style.display = 'inline-flex';

  // Set Next button text
  if (state.currentBaselineIndex === state.baselineQuestions.length - 1) {
    nextBtn.innerHTML = `
      <span>Calculate Preliminary Scores</span>
      <i data-lucide="arrow-right"></i>
    `;
  } else {
    nextBtn.innerHTML = `
      <span>Next</span>
      <i data-lucide="arrow-right"></i>
    `;
  }
  lucide.createIcons();
}

// Update Deep Dive back/next navigation button states
function updateDeepDiveNavButtons() {
  const backBtn = document.getElementById('deep-dive-back-btn');
  const nextBtn = document.getElementById('deep-dive-next-btn');
  const errorEl = document.getElementById('deep-dive-error');

  if (errorEl) errorEl.style.display = 'none';

  // Toggle Back button active state
  backBtn.disabled = (state.currentDeepDiveIndex === 0);

  // Next button is always visible so they can skip questions manually
  nextBtn.style.display = 'inline-flex';

  // Set Next button text
  const isLast = (state.currentDeepDiveIndex === state.deepDiveQuestions.length - 1);
  if (isLast) {
    nextBtn.innerHTML = `
      <span>Calculate Final Results</span>
      <i data-lucide="check-check"></i>
    `;
  } else {
    nextBtn.innerHTML = `
      <span>Next</span>
      <i data-lucide="arrow-right"></i>
    `;
  }
  lucide.createIcons();
}

// HTML generator for Question Cards
function createQuestionCard(question, sequentialNumber, namePrefix) {
  // Set checked state if already answered (e.g. on return or state change)
  const currentVal = state.answers[question.originalNumber] || null;

  if (question.originalNumber === 999) {
    return `
      <div class="question-card scenario-card" id="q-card-999">
        <div class="question-header">
          <div class="q-number">${sequentialNumber}</div>
          <div class="q-text">${question.text}</div>
        </div>
        <div class="scenario-options">
          ${question.options.map(opt => {
            const checkedStr = currentVal === opt.value ? 'checked' : '';
            return `
              <div class="scenario-option">
                <input type="radio" 
                       id="radio-scenario-${opt.value}" 
                       name="q-999" 
                       value="${opt.value}"
                       data-qnum="999"
                       ${checkedStr}
                       required>
                <label for="radio-scenario-${opt.value}" class="scenario-label">
                  <span class="option-letter">${opt.value}</span>
                  <span class="option-desc">${opt.label}</span>
                </label>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div class="question-card" id="q-card-${question.originalNumber}">
      <div class="question-header">
        <div class="q-number">${sequentialNumber}</div>
        <div class="q-text">${question.text}</div>
      </div>
      <div class="rating-scale">
        ${[1, 2, 3, 4, 5].map(score => {
          const desc = getLikertLabel(score);
          const checkedStr = currentVal === score ? 'checked' : '';
          return `
            <div class="rating-option">
              <input type="radio" 
                     id="radio-${namePrefix}-${question.originalNumber}-${score}" 
                     name="q-${question.originalNumber}" 
                     value="${score}"
                     data-qnum="${question.originalNumber}"
                     ${checkedStr}
                     required>
              <label for="radio-${namePrefix}-${question.originalNumber}-${score}" class="rating-label">
                <span class="option-score">${score}</span>
                <span class="option-desc">${desc}</span>
              </label>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// Likert Scale helper labels
function getLikertLabel(score) {
  switch (score) {
    case 1: return "Strongly Disagree";
    case 2: return "Disagree";
    case 3: return "Neutral";
    case 4: return "Agree";
    case 5: return "Strongly Agree";
    default: return "";
  }
}

// Track Radio Clicks to update progress bar and auto-advance
function attachRadioListeners(stage) {
  const radios = document.querySelectorAll(`input[type="radio"]`);
  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const qNum = parseInt(e.target.dataset.qnum, 10);
      let val = e.target.value;
      if (!isNaN(val) && val.trim() !== '') {
        val = parseInt(val, 10);
      }
      state.answers[qNum] = val;
      updateProgress(stage === 'baseline' ? 'baseline' : 'deep-dive');
      saveProgress();
      
      // Visual highlight for the answered card
      const card = document.getElementById(`q-card-${qNum}`);
      if (card) {
        card.style.borderColor = 'var(--secondary-color)';
        card.style.background = 'rgba(20, 184, 166, 0.02)';
      }

      // Auto-advance with a slight delay so the user sees the visual selection highlight
      setTimeout(() => {
        if (stage === 'baseline') {
          if (state.baselineValidationMode) {
            const nextIndex = findNextUnansweredBaselineIndex(state.currentBaselineIndex);
            if (nextIndex !== -1) {
              state.currentBaselineIndex = nextIndex;
              saveProgress();
              renderBaselineQuestions();
            } else {
              state.baselineValidationMode = false;
              const errorEl = document.getElementById('baseline-error');
              if (errorEl) errorEl.style.display = 'none';
              handleBaselineSubmit();
            }
          } else {
            if (state.currentBaselineIndex < state.baselineQuestions.length - 1) {
              state.currentBaselineIndex++;
              saveProgress();
              renderBaselineQuestions();
            } else {
              if (validateBaselineAnswers()) {
                handleBaselineSubmit();
              }
            }
          }
        } else if (stage === 'deep-dive') {
          if (state.deepDiveValidationMode) {
            const nextIndex = findNextUnansweredDeepDiveIndex(state.currentDeepDiveIndex);
            if (nextIndex !== -1) {
              state.currentDeepDiveIndex = nextIndex;
              saveProgress();
              renderDeepDiveQuestions();
            } else {
              state.deepDiveValidationMode = false;
              const errorEl = document.getElementById('deep-dive-error');
              if (errorEl) errorEl.style.display = 'none';
              handleDeepDiveSubmit();
            }
          } else {
            if (state.currentDeepDiveIndex < state.deepDiveQuestions.length - 1) {
              state.currentDeepDiveIndex++;
              saveProgress();
              renderDeepDiveQuestions();
            } else {
              if (validateDeepDiveAnswers()) {
                handleDeepDiveSubmit();
              }
            }
          }
        }
      }, 350); // 350ms delay
    });
  });
}

// Update the Wizard Step Navigation bar
function updateWizardNavigation() {
  const steps = [1, 2, 3];
  steps.forEach(s => {
    const indicator = document.getElementById(`step-${s}-indicator`);
    if (s < state.currentStep) {
      indicator.classList.remove('active');
      indicator.classList.add('completed');
      const icon = indicator.querySelector('.step-num');
      icon.innerHTML = `<i data-lucide="check" style="width:16px;height:16px;"></i>`;
    } else if (s === state.currentStep) {
      indicator.classList.remove('completed');
      indicator.classList.add('active');
      indicator.querySelector('.step-num').textContent = s;
    } else {
      indicator.classList.remove('active', 'completed');
      indicator.querySelector('.step-num').textContent = s;
    }
  });

  // Lines
  const line1 = document.getElementById('step-line-1');
  const line2 = document.getElementById('step-line-2');
  
  if (state.currentStep > 1) line1.classList.add('completed');
  else line1.classList.remove('completed');
  
  if (state.currentStep > 2) line2.classList.add('completed');
  else line2.classList.remove('completed');

  lucide.createIcons();
}

// Update the progress bars
function updateProgress(stage) {
  if (stage === 'baseline') {
    const total = state.baselineQuestions.length;
    const count = state.baselineQuestions.filter(q => state.answers[q.originalNumber] !== undefined).length;
    const pct = Math.round((count / total) * 100);
    document.getElementById('baseline-progress-text').textContent = `${pct}% (${count} of ${total})`;
    document.getElementById('baseline-progress-fill').style.width = `${pct}%`;
  } else if (stage === 'deep-dive') {
    const totalCount = state.deepDiveQuestions.length;
    const count = state.deepDiveQuestions.filter(q => state.answers[q.originalNumber] !== undefined).length;
    const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    document.getElementById('deep-dive-progress-text').textContent = `${pct}% (${count} of ${totalCount})`;
    document.getElementById('deep-dive-progress-fill').style.width = `${pct}%`;
  }
}

// Process Stage 1 Baseline Form
function handleBaselineSubmit() {
  const errorEl = document.getElementById('baseline-error');
  errorEl.style.display = 'none';

  if (!validateBaselineAnswers()) {
    return;
  }

  // Calculate preliminary type scores without contrast enhancement to identify real raw ties
  const prelimScores = calculateScores(false);
  
  // Find highest score
  let maxScore = -1;
  Object.values(prelimScores).forEach(score => {
    if (score > maxScore) maxScore = score;
  });

  // Find all types matching max score (handling ties with precision epsilon)
  const topTypes = [];
  Object.entries(prelimScores).forEach(([typeNum, score]) => {
    if (Math.abs(score - maxScore) < 1e-7) {
      topTypes.push(parseInt(typeNum, 10));
    }
  });

  state.topTypes = topTypes;

  // Branching: If single top type, end test immediately and redirect to Results, skipping Deep Dive
  if (topTypes.length === 1) {
    state.currentStep = 3;
    state.deepDiveQuestions = []; // Clear deep dive questions
    saveProgress();
    updateWizardNavigation();
    renderResults();
    showPanel('results-stage');
    showToast('Assessment complete! Dominant profile identified.', 'success');
    return;
  }
  
  // If multi-type tie, inject exactly 15 deep-dive questions split strictly among tied types
  const numTied = topTypes.length;
  state.deepDiveQuestions = [];

  const questionsPerType = {};
  topTypes.forEach(t => {
    questionsPerType[t] = 0;
  });

  let allocated = 0;
  while (allocated < 15) {
    for (let i = 0; i < numTied && allocated < 15; i++) {
      const t = topTypes[i];
      questionsPerType[t]++;
      allocated++;
    }
  }

  topTypes.forEach(typeNum => {
    const countNeeded = questionsPerType[typeNum];
    if (countNeeded === 0) return;

    const allTypeQuestions = state.allQuestionsByType[typeNum].questions;
    const selectedSeq = getNSequentialQuestions(allTypeQuestions, state.baselineQuestions, countNeeded);
    
    selectedSeq.forEach(q => {
      state.deepDiveQuestions.push({
        ...q,
        typeNumber: typeNum
      });
    });
  });

  // Show transition screen showing top types
  const transitionContainer = document.getElementById('top-types-preview-container');
  transitionContainer.innerHTML = '';
  topTypes.forEach(typeNum => {
    const typeProfile = TYPE_PROFILES[typeNum];
    const scoreVal = prelimScores[typeNum].toFixed(2);
    transitionContainer.innerHTML += `
      <div class="type-preview-badge">
        <span class="num">${typeNum}</span>
        <span class="name">${typeProfile.title}</span>
        <span class="score">Score: ${scoreVal}/5.0</span>
      </div>
    `;
  });

  state.currentStep = 2;
  saveProgress();
  showPanel('transition-stage');
}

// Find N consecutive questions from file that don't overlap with baseline
function getNSequentialQuestions(allQuestions, baselineQuestions, n) {
  const baselineIds = new Set(baselineQuestions.map(q => q.originalNumber));
  const N = allQuestions.length;
  
  // Iterate and find first run of n sequential questions with no overlap
  for (let i = 0; i <= N - n; i++) {
    const chunk = allQuestions.slice(i, i + n);
    const overlaps = chunk.some(q => baselineIds.has(q.originalNumber));
    if (!overlaps) {
      return chunk;
    }
  }
  
  // Fallback: simply filter baseline and grab first n
  return allQuestions.filter(q => !baselineIds.has(q.originalNumber)).slice(0, n);
}

// Process Stage 3 Deep Dive Form
function handleDeepDiveSubmit() {
  const errorEl = document.getElementById('deep-dive-error');
  errorEl.style.display = 'none';

  if (!validateDeepDiveAnswers()) {
    return;
  }

  // Complete Assessment
  state.currentStep = 3;
  saveProgress();
  updateWizardNavigation();
  renderResults();
  showPanel('results-stage');
}

// Missed questions redirection helper functions
function findNextUnansweredBaselineIndex(startIndex = 0) {
  const len = state.baselineQuestions.length;
  for (let i = startIndex; i < len; i++) {
    const q = state.baselineQuestions[i];
    if (state.answers[q.originalNumber] === undefined) {
      return i;
    }
  }
  for (let i = 0; i < startIndex; i++) {
    const q = state.baselineQuestions[i];
    if (state.answers[q.originalNumber] === undefined) {
      return i;
    }
  }
  return -1;
}

// Find next unanswered deep dive index helper
function findNextUnansweredDeepDiveIndex(startIndex = 0) {
  const len = state.deepDiveQuestions.length;
  for (let i = startIndex; i < len; i++) {
    const q = state.deepDiveQuestions[i];
    if (state.answers[q.originalNumber] === undefined) {
      return i;
    }
  }
  for (let i = 0; i < startIndex; i++) {
    const q = state.deepDiveQuestions[i];
    if (state.answers[q.originalNumber] === undefined) {
      return i;
    }
  }
  return -1;
}

// Validate that all baseline questions are answered, redirecting if skipped
function validateBaselineAnswers() {
  const unansweredIndex = state.baselineQuestions.findIndex(q => state.answers[q.originalNumber] === undefined);
  if (unansweredIndex !== -1) {
    state.baselineValidationMode = true;
    state.currentBaselineIndex = unansweredIndex;
    saveProgress();
    renderBaselineQuestions();
    
    const errorEl = document.getElementById('baseline-error');
    if (errorEl) {
      errorEl.textContent = `Some questions were missed or skipped. Please answer all ${state.baselineQuestions.length} questions to proceed.`;
      errorEl.style.display = 'block';
    }
    showToast('Redirecting to the first missed question.', 'error');
    return false;
  }
  state.baselineValidationMode = false;
  const errorEl = document.getElementById('baseline-error');
  if (errorEl) errorEl.style.display = 'none';
  return true;
}

// Validate that all deep dive questions are answered, redirecting if skipped
function validateDeepDiveAnswers() {
  const unansweredIndex = state.deepDiveQuestions.findIndex(q => state.answers[q.originalNumber] === undefined);
  if (unansweredIndex !== -1) {
    state.deepDiveValidationMode = true;
    state.currentDeepDiveIndex = unansweredIndex;
    saveProgress();
    renderDeepDiveQuestions();
    
    const errorEl = document.getElementById('deep-dive-error');
    if (errorEl) {
      errorEl.textContent = 'Some deep-dive questions were missed or skipped. Please answer all of them to proceed.';
      errorEl.style.display = 'block';
    }
    showToast('Redirecting to the first missed deep-dive question.', 'error');
    return false;
  }
  state.deepDiveValidationMode = false;
  const errorEl = document.getElementById('deep-dive-error');
  if (errorEl) errorEl.style.display = 'none';
  return true;
}

// Calculate type scores (averages of answered questions per type)
function calculateScores(enhanced = true) {
  const typeSums = {};
  const typeCounts = {};
  const ratingCounts = {};

  // Initialize all types 1-9 to 0
  for (let t = 1; t <= 9; t++) {
    typeSums[t] = 0;
    typeCounts[t] = 0;
    ratingCounts[t] = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  }

  // Iterate over all answered baseline and deep dive questions (except the scenario question 999 first)
  const allAskedQuestions = [...state.baselineQuestions, ...state.deepDiveQuestions];
  
  allAskedQuestions.forEach(q => {
    if (q.originalNumber !== 999) {
      const rating = state.answers[q.originalNumber];
      if (rating !== undefined) {
        typeSums[q.typeNumber] += rating;
        typeCounts[q.typeNumber] += 1;
        ratingCounts[q.typeNumber][rating] += 1;
      }
    }
  });

  // Calculate raw averages from standard baseline/deep-dive questions
  const rawAverages = {};
  for (let t = 1; t <= 9; t++) {
    rawAverages[t] = typeCounts[t] > 0 ? (typeSums[t] / typeCounts[t]) : 0;
  }

  // Inject the scenario question score exclusively to its corresponding Enneagram type
  const scenarioRating = state.answers[999];
  if (scenarioRating !== undefined) {
    const selectedType = scenarioRating.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    if (selectedType >= 1 && selectedType <= 9) {
      const weight = 2.0; // Heavily weighted factor exclusively applied
      typeSums[selectedType] += 5.0 * weight;
      typeCounts[selectedType] += weight;
      ratingCounts[selectedType][5] += weight;
      
      // Update rawAverage for the selected type
      rawAverages[selectedType] = typeSums[selectedType] / typeCounts[selectedType];
    }
  }

  if (!enhanced) {
    return rawAverages;
  }

  // Calculate raw averages and find dominant type using tie-breaker
  const tieBrokenScores = {};
  let maxTieBrokenScore = -1;
  let candidates = [];

  for (let t = 1; t <= 9; t++) {
    const rawAvg = rawAverages[t];
    const num5 = ratingCounts[t][5] || 0;
    const num4 = ratingCounts[t][4] || 0;
    const num3 = ratingCounts[t][3] || 0;
    const tieBreaker = (num5 * 1e-4) + (num4 * 1e-5) + (num3 * 1e-6);
    
    const tbScore = rawAvg + tieBreaker;
    tieBrokenScores[t] = tbScore;
    
    if (tbScore > maxTieBrokenScore) {
      maxTieBrokenScore = tbScore;
      candidates = [t];
    } else if (Math.abs(tbScore - maxTieBrokenScore) < 1e-9) {
      candidates.push(t);
    }
  }

  // Deterministic, unbiased resolution of ties using a hash of all answers:
  let dominantType = 1;
  if (candidates.length > 0) {
    const answersHash = Object.entries(state.answers).reduce((sum, [qNum, val]) => {
      const code = typeof val === 'number' ? val : val.charCodeAt(0);
      return sum + parseInt(qNum) * code;
    }, 0);
    dominantType = candidates[answersHash % candidates.length];
  }

  // Apply exponential contrast enhancement scaling
  const k = 1.2;
  const scores = {};
  const maxRawAvg = rawAverages[dominantType];

  for (let t = 1; t <= 9; t++) {
    const rawAvg = rawAverages[t];
    if (rawAvg === 0) {
      scores[t] = 0;
    } else if (t === dominantType) {
      // The dominant type maintains its exact raw average
      scores[t] = rawAvg;
    } else {
      // Runner-ups are exponentially decayed relative to their distance from the top.
      const rawDiff = maxRawAvg - rawAvg;
      const effectiveDiff = rawDiff === 0 ? 0.05 : rawDiff;
      scores[t] = rawAvg * Math.exp(-k * effectiveDiff);
    }
  }

  return scores;
}

// Render Results View
function renderResults() {
  const finalScores = calculateScores();
  
  // Determine dominant type
  let dominantType = 1;
  let maxScore = -1;
  
  Object.entries(finalScores).forEach(([typeNum, score]) => {
    if (score > maxScore) {
      maxScore = score;
      dominantType = parseInt(typeNum, 10);
    }
  });

  // Fill in dominant profile card
  const profile = TYPE_PROFILES[dominantType];
  document.getElementById('dominant-type-number').textContent = dominantType;
  document.getElementById('dominant-type-title').textContent = profile.title;
  document.getElementById('dominant-type-subtitle').textContent = `The Core Orientation matches: ${profile.role}`;
  document.getElementById('dominant-type-desc').textContent = profile.description;
  document.getElementById('dominant-orientation').textContent = profile.role;

  // Render key trait tags
  const traitsContainer = document.getElementById('dominant-traits');
  traitsContainer.innerHTML = '';
  profile.keyTraits.forEach(trait => {
    traitsContainer.innerHTML += `<span class="trait-tag">${trait}</span>`;
  });

  // 1. Populate Core Motivations
  document.getElementById('mot-key-drivers').textContent = profile.coreMotivations.keyDrivers;
  document.getElementById('mot-biggest-fear').textContent = profile.coreMotivations.biggestFear;
  document.getElementById('mot-core-values').textContent = profile.coreMotivations.coreValues;
  document.getElementById('mot-decision-making').textContent = profile.coreMotivations.decisionMaking;
  document.getElementById('mot-stress-reactions').textContent = profile.coreMotivations.stressReactions;
  document.getElementById('mot-security-triggers').textContent = profile.coreMotivations.securityTriggers;

  // 2. Populate Core Personality Summary
  document.getElementById('sum-core-fear').textContent = profile.coreSummary.fear;
  document.getElementById('sum-core-desire').textContent = profile.coreSummary.desire;
  document.getElementById('sum-core-weakness').textContent = profile.coreSummary.weakness;
  document.getElementById('sum-soul-message').textContent = profile.coreSummary.soulMessage;

  // 3. Populate Enneagram Arrows (Growth & Stress)
  const growthArrow = profile.arrows.growth;
  const stressArrow = profile.arrows.stress;
  document.getElementById('arrow-growth-text').innerHTML = `<strong>Integrates to Type ${growthArrow.type}:</strong> ${growthArrow.explanation}`;
  document.getElementById('arrow-stress-text').innerHTML = `<strong>Disintegrates to Type ${stressArrow.type}:</strong> ${stressArrow.explanation}`;
  
  // Draw Arrows SVG
  drawArrowsSVG(dominantType, growthArrow.type, stressArrow.type);

  // 4. Calculate and Populate Wings
  // Adjacent types (wrap around)
  const leftWing = dominantType === 1 ? 9 : dominantType - 1;
  const rightWing = dominantType === 9 ? 1 : dominantType + 1;
  const leftScore = finalScores[leftWing] || 0;
  const rightScore = finalScores[rightWing] || 0;
  
  const dominantWing = leftScore >= rightScore ? leftWing : rightWing;
  const wingDetails = profile.wings[dominantWing];
  
  document.getElementById('wings-archetype-title').textContent = `Dominant Wing Archetype: ${wingDetails.archetype}`;
  document.getElementById('wings-influence-text').textContent = wingDetails.influence;

  // Draw Wings SVG
  drawWingsSVG(dominantType, leftWing, rightWing, leftScore, rightScore, dominantWing);

  // 5. Populate What to Do Next
  document.getElementById('next-personal-growth').textContent = profile.nextSteps.personalGrowth;
  document.getElementById('next-relationship').textContent = profile.nextSteps.relationship;
  document.getElementById('next-career').textContent = profile.nextSteps.career;
  document.getElementById('next-stress-management').textContent = profile.nextSteps.stressManagement;
  document.getElementById('next-daily-habit').textContent = profile.nextSteps.dailyHabit;

  // Render type similarity match list with progress bars
  const breakdownList = document.getElementById('types-breakdown-list');
  breakdownList.innerHTML = '';
  
  Object.entries(finalScores)
    .sort((a, b) => b[1] - a[1]) // Sort descending
    .forEach(([typeNum, score]) => {
      const typeProfile = TYPE_PROFILES[typeNum];
      const percentage = Math.round(score * 20); // 1-5 scale -> % (e.g. 5 = 100%)
      const isDominant = parseInt(typeNum, 10) === dominantType;
      
      breakdownList.innerHTML += `
        <div class="type-bar-item ${isDominant ? 'dominant' : ''}">
          <div class="type-bar-info">
            <span class="type-bar-name">Type ${typeNum} &mdash; ${typeProfile.title}</span>
            <span class="type-bar-percentage">${score.toFixed(2)} / 5.0 (${percentage}%)</span>
          </div>
          <div class="type-bar-track">
            <div class="type-bar-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    });

  // Render answered questions list (accordion content)
  const answersListContainer = document.getElementById('answers-review-list');
  answersListContainer.innerHTML = '';
  
  const allAskedQuestions = [...state.baselineQuestions, ...state.deepDiveQuestions];
  document.getElementById('answers-accordion-title').textContent = `Review Your Responses (${allAskedQuestions.length} items)`;
  // Sort questions by original order
  allAskedQuestions.forEach((q, idx) => {
    const rating = state.answers[q.originalNumber];
    const isScenario = q.originalNumber === 999;
    const typeProfile = isScenario ? { title: 'Culinary Motivation' } : (TYPE_PROFILES[q.typeNumber] || { title: `Type ${q.typeNumber}` });
    const categoryText = isScenario ? 'Culinary Motivation Scenario' : `Type ${q.typeNumber} (${typeProfile.title})`;
    const ratingText = isScenario ? `Option ${rating}` : `Rating: ${rating} / 5 (${getLikertLabel(rating)})`;
    const ratingClass = isScenario ? 'score-scenario' : `score-${rating}`;
    
    answersListContainer.innerHTML += `
      <div class="ans-item">
        <div class="ans-q-info">
          <span class="ans-tag">Q${idx + 1}</span>
          <span class="ans-text">${q.text}</span>
        </div>
        <div class="ans-details">
          <span class="ans-type">${categoryText}</span>
          <span class="ans-score ${ratingClass}">${ratingText}</span>
        </div>
      </div>
    `;
  });

  // Render Chart
  renderChart(finalScores);
}

// Draw Enneagram Growth/Stress Arrows SVG Diagram
function drawArrowsSVG(dominantType, growthType, stressType) {
  const container = document.getElementById('arrows-svg-container');
  if (!container) return;
  
  const size = 200;
  const center = size / 2;
  const r = 70;
  
  const getCoords = (type) => {
    // Type 9 is at top (12 o'clock), 1-8 clockwise
    const index = type === 9 ? 0 : type;
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 9;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Generate dots and numbers for all 9 types
  let dotsHtml = '';
  let labelsHtml = '';
  for (let i = 1; i <= 9; i++) {
    const coords = getCoords(i);
    const isDom = i === dominantType;
    const isGrowth = i === growthType;
    const isStress = i === stressType;
    
    let color = 'var(--text-muted)';
    let sizeRadius = 4;
    let stroke = 'none';
    let strokeWidth = 0;
    
    if (isDom) {
      color = 'var(--primary-color)';
      sizeRadius = 7;
      stroke = 'rgba(99, 102, 241, 0.4)';
      strokeWidth = 4;
    } else if (isGrowth) {
      color = '#10b981';
      sizeRadius = 5.5;
    } else if (isStress) {
      color = '#ef4444';
      sizeRadius = 5.5;
    }

    dotsHtml += `<circle cx="${coords.x}" cy="${coords.y}" r="${sizeRadius}" fill="${color}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
    labelsHtml += `<text x="${coords.x}" y="${coords.y - 9}" fill="${isDom ? 'var(--text-primary)' : 'var(--text-secondary)'}" font-size="9" font-weight="${isDom ? 'bold' : 'normal'}" text-anchor="middle">${i}</text>`;
  }

  const pDom = getCoords(dominantType);
  const pGrowth = getCoords(growthType);
  const pStress = getCoords(stressType);

  const svg = `
    <svg width="100%" height="100%" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer circle -->
      <circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="var(--bg-card-border)" stroke-width="1.5" stroke-dasharray="3 3" />
      
      <!-- Arrow lines -->
      <!-- Stress Arrow -->
      <line x1="${pDom.x}" y1="${pDom.y}" x2="${pStress.x}" y2="${pStress.y}" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrow-red-c)" />
      <!-- Growth Arrow -->
      <line x1="${pDom.x}" y1="${pDom.y}" x2="${pGrowth.x}" y2="${pGrowth.y}" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrow-green-c)" />
      
      <!-- Arrow definitions for marker-end -->
      <defs>
        <marker id="arrow-green-c" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
        </marker>
        <marker id="arrow-red-c" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
        </marker>
      </defs>

      ${dotsHtml}
      ${labelsHtml}
    </svg>
  `;
  container.innerHTML = svg;
}

// Draw Wings SVG Diagram
function drawWingsSVG(dominantType, leftWing, rightWing, leftScore, rightScore, dominantWing) {
  const container = document.getElementById('wings-svg-container');
  if (!container) return;
  
  const width = 240;
  const height = 120;
  
  const cxDom = width / 2;
  const cyDom = height / 2 - 10;
  
  const cxLeft = 45;
  const cyLeft = height / 2 - 10;
  
  const cxRight = width - 45;
  const cyRight = height / 2 - 10;

  const isLeftDom = dominantWing === leftWing;
  const isRightDom = dominantWing === rightWing;

  const leftColor = isLeftDom ? '#14b8a6' : 'var(--text-muted)';
  const rightColor = isRightDom ? '#14b8a6' : 'var(--text-muted)';
  const leftGlow = isLeftDom ? 'rgba(20, 184, 166, 0.4)' : 'none';
  const rightGlow = isRightDom ? 'rgba(20, 184, 166, 0.4)' : 'none';

  const svg = `
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Connecting lines -->
      <line x1="${cxLeft}" y1="${cyLeft}" x2="${cxDom}" y2="${cyDom}" stroke="var(--bg-card-border)" stroke-width="2" />
      <line x1="${cxRight}" y1="${cyRight}" x2="${cxDom}" y2="${cyDom}" stroke="var(--bg-card-border)" stroke-width="2" />
      
      <!-- Left Wing Node -->
      <circle cx="${cxLeft}" cy="${cyLeft}" r="16" fill="var(--bg-input)" stroke="${leftColor}" stroke-width="${isLeftDom ? 3 : 1.5}" style="filter: drop-shadow(0 0 6px ${leftGlow})" />
      <text x="${cxLeft}" y="${cyLeft + 4}" fill="${isLeftDom ? 'var(--text-primary)' : 'var(--text-secondary)'}" font-size="11" font-weight="bold" text-anchor="middle">${leftWing}</text>
      <text x="${cxLeft}" y="${cyLeft + 28}" fill="var(--text-muted)" font-size="9" font-weight="600" text-anchor="middle">Score: ${leftScore.toFixed(2)}</text>
      
      <!-- Right Wing Node -->
      <circle cx="${cxRight}" cy="${cyRight}" r="16" fill="var(--bg-input)" stroke="${rightColor}" stroke-width="${isRightDom ? 3 : 1.5}" style="filter: drop-shadow(0 0 6px ${rightGlow})" />
      <text x="${cxRight}" y="${cyRight + 4}" fill="${isRightDom ? 'var(--text-primary)' : 'var(--text-secondary)'}" font-size="11" font-weight="bold" text-anchor="middle">${rightWing}</text>
      <text x="${cxRight}" y="${cyRight + 28}" fill="var(--text-muted)" font-size="9" font-weight="600" text-anchor="middle">Score: ${rightScore.toFixed(2)}</text>

      <!-- Center Dominant Type Node -->
      <circle cx="${cxDom}" cy="${cyDom}" r="22" fill="var(--bg-input)" stroke="var(--primary-color)" stroke-width="3" style="filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))" />
      <text x="${cxDom}" y="${cyDom + 5}" fill="var(--text-primary)" font-size="13" font-weight="bold" text-anchor="middle">${dominantType}</text>
      <text x="${cxDom}" y="${cyDom + 32}" fill="var(--primary-color)" font-size="9" font-weight="bold" text-anchor="middle">Core</text>
    </svg>
  `;
  container.innerHTML = svg;
}

// Generate the Visual Chart using Chart.js
function renderChart(scores) {
  const ctx = document.getElementById('enneagramChart').getContext('2d');
  
  const labels = Object.keys(scores).map(t => `T${t}: ${TYPE_PROFILES[t].title}`);
  const dataValues = Object.values(scores);

  if (state.chartInstance) {
    state.chartInstance.destroy();
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  const chartConfig = {
    type: state.activeChartType,
    data: {
      labels: labels,
      datasets: [{
        label: 'Type Match Score (1-5)',
        data: dataValues,
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(79, 70, 229, 0.2)',
        borderColor: isDark ? '#818cf8' : '#4f46e5',
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#6366f1'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          titleColor: isDark ? '#f8fafc' : '#0f172a',
          bodyColor: isDark ? '#94a3b8' : '#475569',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1
        }
      },
      scales: state.activeChartType === 'radar' ? {
        r: {
          grid: { color: gridColor },
          angleLines: { color: gridColor },
          pointLabels: {
            color: textColor,
            font: { family: 'Outfit', size: 10, weight: '600' }
          },
          ticks: {
            color: textColor,
            backdropColor: 'transparent',
            stepSize: 1,
            min: 0,
            max: 5
          }
        }
      } : {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { family: 'Outfit' } }
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor, min: 0, max: 5 },
          suggestedMax: 5
        }
      }
    }
  };

  state.chartInstance = new Chart(ctx, chartConfig);
}

// Toggle chart representation
function toggleChartType(type) {
  if (state.activeChartType === type) return;
  
  state.activeChartType = type;
  document.getElementById('btn-chart-radar').classList.toggle('active', type === 'radar');
  document.getElementById('btn-chart-bar').classList.toggle('active', type === 'bar');
  
  const finalScores = calculateScores();
  renderChart(finalScores);
}

// Submit reports to the API endpoint
async function sendEmailReport() {
  const emailInput = document.getElementById('user-email');
  const email = emailInput.value;
  const statusEl = document.getElementById('report-status');
  const sendBtn = document.getElementById('send-report-btn');

  if (!email) return;

  statusEl.textContent = 'Preparing report and sending...';
  statusEl.className = 'status-msg loading';
  sendBtn.disabled = true;

  const finalScores = calculateScores();
  
  let dominantType = 1;
  let maxScore = -1;
  Object.entries(finalScores).forEach(([typeNum, score]) => {
    if (score > maxScore) {
      maxScore = score;
      dominantType = parseInt(typeNum, 10);
    }
  });

  const allAskedQuestions = [...state.baselineQuestions, ...state.deepDiveQuestions];
  const answersList = allAskedQuestions.map(q => ({
    text: q.text,
    typeNumber: q.typeNumber,
    rating: state.answers[q.originalNumber]
  }));

  try {
    const response = await fetch(`${window.location.origin}/api/send-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        scores: finalScores,
        dominantType,
        answers: answersList
      })
    });

    const result = await response.json();
    if (response.ok && result.success) {
      statusEl.textContent = result.message;
      statusEl.className = 'status-msg success';
      showToast('Report generated successfully!', 'success');
      
      // Cache generated report for local download
      if (result.reportHtml) {
        state.lastGeneratedReportHtml = result.reportHtml;
      }
    } else {
      throw new Error(result.message || 'Server error occurred.');
    }
  } catch (error) {
    console.error('Report submission failed:', error);
    statusEl.textContent = `Failed: ${error.message}. Saved locally.`;
    statusEl.className = 'status-msg error';
    showToast('Failed to send report email. Saved to reports folder.', 'error');
  } finally {
    sendBtn.disabled = false;
  }
}

// Local download helper for HTML report
function downloadLocalReport() {
  // If report wasn't generated by email click, generate one on the fly
  let htmlContent = state.lastGeneratedReportHtml;
  
  if (!htmlContent) {
    const finalScores = calculateScores();
    let dominantType = 1;
    let maxScore = -1;
    Object.entries(finalScores).forEach(([typeNum, score]) => {
      if (score > maxScore) {
        maxScore = score;
        dominantType = parseInt(typeNum, 10);
      }
    });

    const profile = TYPE_PROFILES[dominantType];
    const scoreTableRows = Object.entries(finalScores)
      .map(([typeNum, score]) => {
        const typeProfile = TYPE_PROFILES[typeNum] || { title: `Type ${typeNum}` };
        const percentage = Math.round(score * 20);
        const isDominant = parseInt(typeNum, 10) === dominantType;
        return `
          <tr style="background-color: ${isDominant ? 'rgba(99, 102, 241, 0.15)' : 'transparent'}; font-weight: ${isDominant ? 'bold' : 'normal'};">
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Type ${typeNum} — ${typeProfile.title}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${score.toFixed(2)} / 5.00</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${percentage}%</td>
          </tr>
        `;
      }).join('');

    const allAskedQuestions = [...state.baselineQuestions, ...state.deepDiveQuestions];
    const answersList = allAskedQuestions
      .map((ans, idx) => {
        const rating = state.answers[ans.originalNumber];
        const isScenario = ans.originalNumber === 999;
        const typeProfile = isScenario ? { title: 'Culinary Motivation' } : (TYPE_PROFILES[ans.typeNumber] || { title: `Type ${ans.typeNumber}` });
        const categoryText = isScenario ? 'Culinary Motivation Scenario' : `Type ${ans.typeNumber} (${typeProfile.title})`;
        const ratingText = isScenario ? `Option ${rating}` : `${rating} / 5`;
        return `
          <div style="padding: 10px; border-bottom: 1px solid #edf2f7; margin-bottom: 5px;">
            <p style="margin: 0; font-size: 14px; color: #4a5568;"><strong>Q${idx + 1}:</strong> ${ans.text}</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #718096;">
              Category: <strong>${categoryText}</strong> | 
              Your Response: <strong style="color: #4f46e5;">${ratingText}</strong>
            </p>
          </div>
        `;
      }).join('');

    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Enneagram Personality Report</title>
      </head>
      <body style="font-family: 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #2d3748; background-color: #f7fafc; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Your Enneagram Results</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Interactive Assessment Breakdown</p>
          </div>
          <div style="padding: 30px 20px;">
            <h2>Dominant Profile: Type ${dominantType} &mdash; ${profile.title}</h2>
            <p style="font-style: italic; color: #4f46e5; font-weight: 600; margin: 10px 0;">"Core Orientation: ${profile.role}"</p>
            <p>${profile.description}</p>
            
            <div style="margin: 20px 0; padding: 15px; background: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 0 8px 8px 0;">
              <strong>Key Traits:</strong> ${profile.keyTraits.join(', ')}
            </div>

            <h3>Score Breakdown</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #f8fafc; text-align: left;">
                  <th style="padding: 10px; border-bottom: 2px solid #e2e8f0;">Type</th>
                  <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; text-align: center;">Average Rating</th>
                  <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; text-align: right;">Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${scoreTableRows}
              </tbody>
            </table>

            <h3 style="margin-top: 30px;">Questionnaire Responses</h3>
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background-color: #fafbfc; max-height: 400px; overflow-y: auto;">
              ${answersList}
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0;">
            Generated locally by the Enneagram Dashboard.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Enneagram_Report_${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Report HTML downloaded successfully!', 'success');
}

// Show specific panel, hide all other panels
function showPanel(panelId) {
  const panels = ['loading-screen', 'consent-stage', 'baseline-stage', 'transition-stage', 'deep-dive-stage', 'results-stage'];
  panels.forEach(p => {
    document.getElementById(p).classList.toggle('active', p === panelId);
  });
  
  // Scroll to top of panel
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Display simple alert toaster
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? 'check-circle-2' : 'alert-circle';
  toast.innerHTML = `
    <i data-lucide="${icon}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  lucide.createIcons();

  // Slide out and remove toast after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s forwards ease';
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3000);
}

// Helper: Shuffle Array in-place
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
