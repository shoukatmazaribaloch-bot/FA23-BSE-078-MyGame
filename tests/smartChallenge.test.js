const test = require('node:test');
const assert = require('node:assert/strict');
const { computeAdaptiveDifficulty } = require('../js/smartChallenge.js');

test('hot streak should increase challenge intensity and provide a coaching cue', () => {
  const result = computeAdaptiveDifficulty({
    score: 420,
    accuracy: 96,
    streak: 14,
    duration: 100,
    mode: 'bubbles',
    difficulty: 'medium'
  });

  assert.ok(result.challengeLevel === 'HOT' || result.challengeLevel === 'BALANCED');
  assert.ok(result.boost >= 1);
  assert.ok(result.advice.length > 0);
});

test('low accuracy should reduce the adaptive difficulty and recommend recovery', () => {
  const result = computeAdaptiveDifficulty({
    score: 20,
    accuracy: 32,
    streak: 0,
    duration: 40,
    mode: 'bubbles',
    difficulty: 'easy'
  });

  assert.equal(result.challengeLevel, 'RECOVERY');
  assert.ok(result.boost < 1);
  assert.match(result.advice.toLowerCase(), /accuracy|slow|focus/i);
});
