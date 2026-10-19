/**
 * Pure, immutable domain utilities for Me-Ari (Voice Memoir)
 */

export function formatDuration(seconds) {
  if (typeof seconds !== 'number' || Number.isNaN(seconds) || seconds < 0) {
    return '00:00';
  }
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const EMOTION_MAP = Object.freeze({
  평온: {
    label: '평온',
    icon: '🌿',
    toneColor: 'emerald',
    palette: ['#131829', '#473b54', '#d97706', '#fef3c7'],
    headlineTemplate: (score) =>
      `"오늘은 조금 지친 하루였지만, 끝자락엔 ${score}%의 따뜻한 평온과 안도감이 담겨 있어요."`,
    detail:
      '녹음 초반에는 일상 속 긴장감이 살짝 묻어났으나, 이야기를 풀어낼수록 호흡과 목소리 톤이 한결 부드러워지며 차분한 안정감을 되찾았습니다.',
  },
  기쁨: {
    label: '기쁨',
    icon: '✨',
    toneColor: 'amber',
    palette: ['#1e1b4b', '#b45309', '#f59e0b', '#fef08a'],
    headlineTemplate: (score) =>
      `"목소리에서 ${score}%의 밝은 생기와 기분 좋은 설렘이 또렷하게 전해지는 하루네요."`,
    detail:
      '경쾌한 발화 리듬과 밝은 억양에서 오늘 경험한 순간들의 즐거움이 그대로 느껴집니다. 이 긍정적인 에너지를 서재에 오래 간직해 보세요.',
  },
  설렘: {
    label: '설렘',
    icon: '✨',
    toneColor: 'amber',
    palette: ['#1e1b4b', '#9d174d', '#f59e0b', '#fde68a'],
    headlineTemplate: (score) =>
      `"새로운 시작을 앞둔 듯 ${score}%의 따뜻한 설렘이 목소리마다 묻어납니다."`,
    detail:
      '조금씩 빨라지는 호흡과 기대감이 담긴 어조에서 내일을 향한 설렘이 느껴집니다.',
  },
  피로: {
    label: '피로',
    icon: '🌙',
    toneColor: 'indigo',
    palette: ['#0f172a', '#1e293b', '#6366f1', '#cbd5e1'],
    headlineTemplate: (score) =>
      `"오늘은 유독 고단한 하루였네요. ${score}%의 피로도가 느껴져 따뜻한 휴식이 필요해 보여요."`,
    detail:
      '낮게 가라앉은 톤과 느린 호흡에서 오늘 하루 버텨낸 무게가 전해집니다. 오늘 밤만큼은 모든 생각을 내려놓고 편안히 쉬어가세요.',
  },
  슬픔: {
    label: '슬픔',
    icon: '🌧',
    toneColor: 'indigo',
    palette: ['#0f172a', '#312e81', '#818cf8', '#e2e8f0'],
    headlineTemplate: (score) =>
      `"마음속에 ${score}%의 잔잔한 우울과 아쉬움이 머물고 있는 밤이네요."`,
    detail:
      '감정을 솔직하게 목소리로 꺼내어 놓는 것만으로도 마음의 정리가 시작됩니다. 오늘의 감정도 소중한 나의 한 페이지입니다.',
  },
});

export function getEmotionMeta(rawEmotion, rawScore = 80) {
  const safeScore =
    typeof rawScore === 'number' && !Number.isNaN(rawScore)
      ? Math.max(0, Math.min(100, Math.round(rawScore)))
      : 80;

  const normalizedKey = String(rawEmotion || '').trim().toLowerCase();
  let mappedKey = '평온';

  if (normalizedKey.includes('기쁨') || normalizedKey.includes('joy') || normalizedKey.includes('행복')) {
    mappedKey = '기쁨';
  } else if (normalizedKey.includes('설렘') || normalizedKey.includes('excit')) {
    mappedKey = '설렘';
  } else if (normalizedKey.includes('피로') || normalizedKey.includes('지침') || normalizedKey.includes('tired')) {
    mappedKey = '피로';
  } else if (
    normalizedKey.includes('슬픔') ||
    normalizedKey.includes('우울') ||
    normalizedKey.includes('sad')
  ) {
    mappedKey = '슬픔';
  }

  const base = EMOTION_MAP[mappedKey];
  return Object.freeze({
    label: base.label,
    icon: base.icon,
    toneColor: base.toneColor,
    palette: [...base.palette],
    commentary: base.headlineTemplate(safeScore),
    detail: base.detail,
  });
}

function deriveTitleFromText(text) {
  const cleaned = String(text || '').trim();
  if (!cleaned) {
    return '가을밤, 창가에 내려앉은 긴 하루의 끝';
  }
  const firstSentence = cleaned.split(/[.!?\n]/)[0].trim();
  if (firstSentence.length <= 28) {
    return firstSentence;
  }
  return `${firstSentence.slice(0, 26).trim()}...`;
}

export function normalizeAnalysisResult(rawAnalysis, fallbackRawText = '') {
  const safeRawText =
    typeof fallbackRawText === 'string' && fallbackRawText.trim().length > 0
      ? fallbackRawText.trim()
      : '오늘 하루의 목소리 기록입니다.';

  const refinedCandidate =
    rawAnalysis &&
    typeof rawAnalysis.refinedText === 'string' &&
    rawAnalysis.refinedText.trim().length > 0 &&
    !rawAnalysis.refinedText.startsWith('Error')
      ? rawAnalysis.refinedText.trim()
      : `${safeRawText}\n\n분주했던 하루의 끝에서 잠시 숨을 고르며, 오늘의 감정을 조용히 갈무리해 본다.`;

  const scoreCandidate =
    rawAnalysis && typeof rawAnalysis.score === 'number' && rawAnalysis.score > 0
      ? Math.min(100, Math.max(10, Math.round(rawAnalysis.score)))
      : 82;

  const emotionMeta = getEmotionMeta(rawAnalysis?.emotion, scoreCandidate);

  const paragraphs = refinedCandidate
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const calmScore = emotionMeta.label === '평온' ? scoreCandidate : Math.max(45, scoreCandidate - 12);
  const fatigueScore = emotionMeta.label === '피로' ? scoreCandidate : 65;
  const immersionScore = Math.min(96, Math.max(60, Math.round((scoreCandidate + 74) / 2)));

  return Object.freeze({
    title: rawAnalysis?.title || deriveTitleFromText(paragraphs[0]),
    refinedText: refinedCandidate,
    paragraphs: paragraphs.length > 0 ? paragraphs : [refinedCandidate],
    rawText: safeRawText,
    emotion: emotionMeta.label,
    emotionIcon: emotionMeta.icon,
    toneColor: emotionMeta.toneColor,
    score: scoreCandidate,
    commentary: emotionMeta.commentary,
    detail: emotionMeta.detail,
    palette: emotionMeta.palette,
    tags: ['#오늘의메아리', `#${emotionMeta.label}`, '#밤의서재'],
    stats: Object.freeze([
      Object.freeze({
        label: '🌿 평온 & 안도감',
        value: calmScore,
        barColor: 'accent',
        note: '하루를 무사히 마친 성취감',
      }),
      Object.freeze({
        label: '🌙 피로도',
        value: fatigueScore,
        barColor: 'indigo',
        note: '충분한 수면과 휴식이 필요해요',
      }),
      Object.freeze({
        label: '🍂 감성 몰입도',
        value: immersionScore,
        barColor: 'emerald',
        note: '일상과 계절에 대한 섬세한 감각',
      }),
    ]),
  });
}

export function prependArchiveEntry(existingEntries, newEntry) {
  const safeList = Array.isArray(existingEntries) ? existingEntries : [];
  if (!newEntry || typeof newEntry !== 'object') {
    return [...safeList];
  }
  return [Object.freeze({ ...newEntry }), ...safeList];
}
