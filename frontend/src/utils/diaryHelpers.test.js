import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDuration,
  getEmotionMeta,
  normalizeAnalysisResult,
  prependArchiveEntry,
} from './diaryHelpers.js';

test('formatDuration converts seconds into MM:SS format safely', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(84), '01:24');
  assert.equal(formatDuration(605), '10:05');
  assert.equal(formatDuration(-5), '00:00');
  assert.equal(formatDuration(NaN), '00:00');
});

test('getEmotionMeta returns matching badge metadata and empathetic commentary', () => {
  const calmMeta = getEmotionMeta('평온', 82);
  assert.equal(calmMeta.label, '평온');
  assert.equal(calmMeta.icon, '🌿');
  assert.ok(calmMeta.commentary.includes('82%'));

  const joyMeta = getEmotionMeta('Joy', 90);
  assert.equal(joyMeta.label, '기쁨');
  assert.equal(joyMeta.icon, '✨');
});

test('normalizeAnalysisResult validates and enriches AI response immutably', () => {
  const rawInput = {
    refinedText: '집으로 돌아오는 길, 선선한 가을 밤공기가 마음을 식혀주었다.\n오늘 하루도 무사히 마쳤다.',
    emotion: '평온',
    score: 85,
  };
  const result = normalizeAnalysisResult(rawInput, '원본 음성 텍스트입니다.');

  assert.equal(result.emotion, '평온');
  assert.equal(result.score, 85);
  assert.equal(result.rawText, '원본 음성 텍스트입니다.');
  assert.ok(Array.isArray(result.paragraphs));
  assert.equal(result.paragraphs.length, 2);
  assert.ok(Array.isArray(result.stats));
  assert.equal(result.stats.length, 3);
  assert.ok(result.title.length > 0);
});

test('normalizeAnalysisResult handles missing or malformed payload gracefully', () => {
  const fallback = normalizeAnalysisResult(null, '짧은 원본 기록');
  assert.equal(fallback.rawText, '짧은 원본 기록');
  assert.ok(fallback.refinedText.includes('짧은 원본 기록'));
  assert.equal(fallback.emotion, '평온');
  assert.equal(typeof fallback.score, 'number');
});

test('prependArchiveEntry returns a new array without mutating existing entries', () => {
  const existing = Object.freeze([
    Object.freeze({ id: 'entry-1', title: '기존 일기' }),
  ]);
  const newEntry = { id: 'entry-2', title: '새로운 일기' };
  const updated = prependArchiveEntry(existing, newEntry);

  assert.equal(existing.length, 1);
  assert.equal(updated.length, 2);
  assert.equal(updated[0].id, 'entry-2');
  assert.notEqual(updated, existing);
});
