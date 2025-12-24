/**
 * API Service for Typer-Web
 * Connects to bramhsastra backend for typing test functionality
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8084';

/**
 * Helper function to make API requests
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

/**
 * Start a new typing test
 * @param {string} difficulty - Difficulty level (easy, medium, hard, expert)
 * @param {number} duration - Test duration in seconds (default: 60)
 * @returns {Promise<{text: string, textId: string, wordCount: number}>}
 */
export async function startTypingTest(difficulty = 'medium', duration = 60) {
  return apiRequest('/typer/test/start', {
    method: 'POST',
    body: JSON.stringify({ difficulty, duration }),
  });
}

/**
 * Submit typing test results
 * @param {Object} params
 * @param {string} params.userId - User identifier
 * @param {string} params.textBankId - Text bank identifier (optional)
 * @param {string} params.difficulty - Difficulty level
 * @param {number} params.duration - Time taken in seconds
 * @param {number} params.totalChars - Total characters typed
 * @param {number} params.correctChars - Correctly typed characters
 * @param {number} params.errors - Number of errors
 * @param {number} params.wpm - Calculated WPM
 * @param {number} params.accuracy - Calculated accuracy percentage
 * @returns {Promise<{success: boolean, testId: string, wpm: number, accuracy: number}>}
 */
export async function submitTypingTest({ userId, textBankId, difficulty, duration, totalChars, correctChars, errors, wpm, accuracy }) {
  return apiRequest('/typer/test/submit', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      textBankId: textBankId || null,
      difficulty: difficulty.toUpperCase(),
      duration,
      totalChars,
      correctChars,
      errors,
      wpm,
      accuracy,
    }),
  });
}

/**
 * Get user statistics
 * @param {string} userId - User identifier
 * @returns {Promise<{averageWpm: number, averageAccuracy: number, testsCompleted: number, bestWpm: number}>}
 */
export async function getUserStats(userId) {
  return apiRequest(`/typer/user/stats?userId=${encodeURIComponent(userId)}`);
}

/**
 * Get leaderboard
 * @param {number} limit - Number of entries to retrieve (default: 10)
 * @returns {Promise<Array<{rank: number, username: string, wpm: number, accuracy: number}>>}
 */
export async function getLeaderboard(limit = 10) {
  return apiRequest(`/typer/leaderboard?limit=${limit}`);
}

/**
 * Get texts by difficulty level
 * @param {string} difficulty - Difficulty level
 * @returns {Promise<Array<{id: string, text: string, wordCount: number}>>}
 */
export async function getTextsByDifficulty(difficulty) {
  return apiRequest(`/typer/text/all?difficulty=${encodeURIComponent(difficulty)}`);
}

/**
 * Generate a random user ID for anonymous users
 * @returns {string}
 */
export function generateUserId() {
  return 'user_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Get or create user ID from localStorage
 * @returns {string}
 */
export function getOrCreateUserId() {
  if (typeof window === 'undefined') return generateUserId();

  let userId = localStorage.getItem('typer_user_id');
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem('typer_user_id', userId);
  }
  return userId;
}

// Sample texts for offline/demo mode
export const SAMPLE_TEXTS = {
  easy: [
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
    "Simple words are easy to type. Practice makes perfect when learning to type fast.",
    "Typing is a skill that improves with practice. Keep your fingers on the home row.",
  ],
  medium: [
    "Programming is the art of organizing complexity. Clean code reads like well-written prose and clearly expresses its intent.",
    "The best way to predict the future is to create it. Innovation distinguishes between a leader and a follower.",
    "Success is not final, failure is not fatal. It is the courage to continue that counts in the end.",
  ],
  hard: [
    "Asynchronous JavaScript operations utilize promises and callbacks to handle non-blocking I/O efficiently.",
    "Polymorphism, encapsulation, and inheritance form the three pillars of object-oriented programming paradigms.",
    "Microservices architecture distributes application logic across independently deployable, loosely coupled services.",
  ],
  expert: [
    "The ephemeral nature of quantum superposition enables qubits to simultaneously represent multiple computational states.",
    "Implementing Byzantine fault tolerance requires consensus algorithms that withstand arbitrary malicious behavior.",
    "Cryptocurrency mining difficulty adjustments maintain consistent block generation intervals despite hashrate fluctuations.",
  ],
};

/**
 * Get a sample text for demo mode, sized appropriately for the duration
 * @param {string} difficulty - Difficulty level
 * @param {number} duration - Test duration in seconds (default: 60)
 * @returns {string} - Text appropriately sized for the duration
 */
export function getSampleText(difficulty = 'medium', duration = 60) {
  const texts = SAMPLE_TEXTS[difficulty] || SAMPLE_TEXTS.medium;

  // Calculate approximate words needed based on duration
  // Assuming average typing speed of ~40 WPM for target text
  const wordsNeeded = Math.ceil((duration / 60) * 50); // 50 words per minute target

  // Combine and repeat texts to reach the required length
  let combinedText = '';
  let textIndex = 0;

  while (combinedText.split(' ').length < wordsNeeded) {
    combinedText += (combinedText ? ' ' : '') + texts[textIndex % texts.length];
    textIndex++;
  }

  return combinedText;
}
