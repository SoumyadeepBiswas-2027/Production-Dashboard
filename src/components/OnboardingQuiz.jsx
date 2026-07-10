import React, { useState } from 'react';
import { evaluateAdhdSupport } from '../utils/aiLogic';

const QUESTIONS = [
  // Inattentive Questions (Index 0, 1, 2)
  { text: "How often do you have trouble wrapping up the final details of a project?", type: "inattentive" },
  { text: "How often do you have difficulty getting things in order when you have to do a task?", type: "inattentive" },
  { text: "How often do you forget appointments or obligations?", type: "inattentive" },
  // Hyperactive/Impulsive Questions (Index 3, 4, 5)
  { text: "How often do you fidget or squirm when you have to sit down for a long time?", type: "hyper" },
  { text: "How often do you feel restless or compelled to do things?", type: "hyper" },
  { text: "How often do you interrupt others when they are busy?", type: "hyper" }
];

const OPTIONS = [
  { label: "Never", value: 0 },
  { label: "Rarely", value: 1 },
  { label: "Sometimes", value: 2 },
  { label: "Often", value: 3 },
  { label: "Very Often", value: 4 }
];

export default function OnboardingQuiz({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleAnswer = (value) => {
    // Save the answer
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    // Go to next question, or calculate results if finished
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults(newAnswers);
    }
  };

  const calculateResults = (finalAnswers) => {
    let rawInattentive = 0;
    let rawHyper = 0;

    // Add up the scores based on question type
    QUESTIONS.forEach((q, index) => {
      if (q.type === "inattentive") {
        rawInattentive += finalAnswers[index];
      } else {
        rawHyper += finalAnswers[index];
      }
    });

    // Scale the raw scores (max 12) up to the 0-100 scale our AI model expects.
    // 12 * 8 = 96 (Close enough to 100 for our thresholds!)
    const inattentiveScore = rawInattentive * 8;
    const hyperImpulsiveScore = rawHyper * 8;

    // --- THE MAGIC HAPPENS HERE ---
    // Feed the scores into the AI Logic we generated from Python!
    const needsSupport = evaluateAdhdSupport(inattentiveScore, hyperImpulsiveScore);

    setResult(needsSupport);
    
    // In a real app, you would save this 'needsSupport' boolean to Firebase here
    // e.g., await updateDoc(userRef, { requiresAdhdSupport: needsSupport })
  };

  return (
    <div style={styles.container}>
      {result === null ? (
        <div style={styles.card}>
          <h2 style={styles.header}>Personalizing your experience...</h2>
          <p style={styles.progress}>Question {currentQuestion + 1} of {QUESTIONS.length}</p>
          
          <h3 style={styles.questionText}>{QUESTIONS[currentQuestion].text}</h3>
          
          <div style={styles.optionsContainer}>
            {OPTIONS.map((opt) => (
              <button 
                key={opt.label} 
                onClick={() => handleAnswer(opt.value)}
                style={styles.button}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          <h2 style={styles.header}>Setup Complete!</h2>
          <p style={styles.resultText}>
            AI Assessment: 
            <strong>{result ? " High-Support Mode Activated" : " Standard Mode Activated"}</strong>
          </p>
          <p style={styles.subText}>
            {result 
              ? "We've adjusted your timers and reminders to be more forgiving and ADHD-friendly."
              : "Your dashboard is set up with standard productivity settings."}
          </p>
          <button style={styles.primaryButton} onClick={() => onComplete && onComplete(result)}>
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

// Basic inline styles to keep it looking clean out of the box
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', padding: '20px' },
  card: { backgroundColor: '#1e1e1e', color: 'white', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' },
  header: { marginTop: 0, marginBottom: '10px' },
  progress: { color: '#888', fontSize: '14px', marginBottom: '20px' },
  questionText: { fontSize: '18px', marginBottom: '30px', lineHeight: '1.4' },
  optionsContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  button: { padding: '12px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', transition: 'background 0.2s' },
  primaryButton: { padding: '12px 24px', backgroundColor: '#4285f4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', marginTop: '20px', fontWeight: 'bold' },
  resultText: { fontSize: '18px', margin: '20px 0' },
  subText: { color: '#ccc', lineHeight: '1.5' }
};