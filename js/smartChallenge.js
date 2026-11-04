(function (global) {
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function normalize(value, min, max) {
    if (max <= min) return 0;
    return clamp((value - min) / (max - min), 0, 1);
  }

  function computeAdaptiveDifficulty({
    score = 0,
    accuracy = 70,
    streak = 0,
    duration = 60,
    mode = 'bubbles',
    difficulty = 'medium'
  } = {}) {
    const accuracyFactor = normalize(accuracy, 35, 100);
    const streakFactor = normalize(streak, 0, 12);
    const paceFactor = normalize(score / Math.max(duration, 1), 0, 6);
    const totalPerformance = clamp(
      accuracyFactor * 0.55 + streakFactor * 0.25 + paceFactor * 0.2,
      0,
      1
    );

    let challengeLevel = 'BALANCED';
    let boost = 1;
    let advice = 'Keep your rhythm steady and focus on accuracy.';

    if (totalPerformance > 0.74) {
      challengeLevel = 'HOT';
      boost = 1.2 + (difficulty === 'hard' ? 0.08 : 0);
      advice = 'You are in a hot streak — stay sharp and keep the pace controlled.';
    } else if (totalPerformance > 0.46) {
      challengeLevel = 'BALANCED';
      boost = 1 + (difficulty === 'hard' ? 0.05 : 0);
      advice = 'Solid rhythm. Maintain your tempo and avoid rushed mistakes.';
    } else if (totalPerformance > 0.24) {
      challengeLevel = 'BUILDING';
      boost = 0.92;
      advice = 'Good start — focus on cleaner hits before pushing the speed.';
    } else {
      challengeLevel = 'RECOVERY';
      boost = 0.8;
      advice = 'Slow down slightly and prioritize accuracy to regain control.';
    }

    return {
      challengeLevel,
      boost,
      advice,
      performanceScore: Number(totalPerformance.toFixed(3)),
      mode,
      difficulty
    };
  }

  const api = { computeAdaptiveDifficulty };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.SmartChallenge = api;
})(typeof window !== 'undefined' ? window : globalThis);
