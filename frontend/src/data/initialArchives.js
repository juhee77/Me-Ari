import { normalizeAnalysisResult } from '../utils/diaryHelpers.js';

export const PROMPT_STARTERS = Object.freeze([
  '💭 "오늘 가장 기억에 남는 장면은..."',
  '🍵 "조금 지쳤지만 나에게 해주고 싶은 말"',
  '✨ "나를 미소 짓게 한 사소한 순간"',
]);

export const INITIAL_ARCHIVES = Object.freeze([
  Object.freeze({
    id: 'memoir-2026-10-17',
    dateLabel: '2026년 10월 17일 토요일 • 밤 10:45',
    shortDate: '10월 17일 (토)',
    dayOfMonth: 17,
    durationLabel: '01:24',
    emoji: '🌙',
    illustrationCaption: '창가에 스미는 가을 밤공기와 따뜻한 차 한 잔의 온기',
    ...normalizeAnalysisResult(
      {
        title: '가을밤, 창가에 내려앉은 긴 하루의 끝',
        refinedText:
          '아침부터 쉴 새 없이 몰아치던 일정 속에서 유난히 숨 가쁘게 달려온 하루였다. 끝없이 이어지는 할 일들에 마음이 조금씩 무거워졌지만, 묵묵히 오늘의 몫을 해낸 나에게 작은 위로를 건네고 싶다.\n\n집으로 돌아오는 길, 뺨에 스치는 선선한 가을 밤공기가 복잡했던 머릿속을 차분히 식혀주었다. 고단함 끝에 찾아온 이 고요한 밤의 평화가 내일의 나를 다시 걷게 할 따뜻한 힘이 되어줄 것이다.',
        emotion: '평온',
        score: 82,
      },
      '아 오늘 하루는 진짜 아침부터 정신이 하나도 없었어. 할 일도 너무 많고 피곤했는데 그래도 어찌저찌 다 끝냈다. 저녁에 퇴근하면서 집 오는 길에 밤공기 마시는데 가을 냄새가 나서 기분이 조금 풀리더라. 오늘 진짜 고생 많았다.'
    ),
  }),
  Object.freeze({
    id: 'memoir-2026-10-15',
    dateLabel: '2026년 10월 15일 목요일 • 밤 11:10',
    shortDate: '10월 15일 (목)',
    dayOfMonth: 15,
    durationLabel: '02:05',
    emoji: '🕯️',
    illustrationCaption: '책상 위 은은한 스탠드 조명 아래 피어오르는 새로운 아이디어',
    ...normalizeAnalysisResult(
      {
        title: '오래 준비하던 사이드 프로젝트의 첫 걸음',
        refinedText:
          '드디어 로컬 AI 모델과 스프링 부트 서버를 연결하는 첫 구조를 잡았다. 막막하게만 느껴졌던 기능들이 하나씩 맞물려 돌아가기 시작할 때의 쾌감은 언제나 특별하다.\n\n내 손으로 직접 빚어내는 작은 서재가 어떤 모습으로 완성될지, 다가올 밤들이 기분 좋은 설렘으로 채워진다.',
        emotion: '설렘',
        score: 91,
      },
      '오늘 드디어 로컬 AI 모델이랑 스프링 부트 연결하는 구조 다 잡았다! 처음에는 막막했는데 하나씩 돌아가는 거 보니까 너무 뿌듯하고 설렌다.'
    ),
  }),
  Object.freeze({
    id: 'memoir-2026-10-12',
    dateLabel: '2026년 10월 12일 월요일 • 밤 09:50',
    shortDate: '10월 12일 (월)',
    dayOfMonth: 12,
    durationLabel: '00:58',
    emoji: '☕',
    illustrationCaption: '비 내리는 창밖 풍경과 김이 피어오르는 따뜻한 라떼 한 잔',
    ...normalizeAnalysisResult(
      {
        title: '비 오는 월요일, 따뜻한 커피 한 잔의 위로',
        refinedText:
          '월요일부터 내린 가을비 탓인지 몸도 마음도 유독 무겁게 가라앉았던 오후였다. 자꾸만 느려지는 걸음을 재촉하기보다, 잠시 카페 창가에 앉아 빗소리에 귀를 기울였다.\n\n두 손에 전해지는 따뜻한 라떼 한 잔의 온기가 지친 하루 사이에 작은 쉼표 하나를 찍어주었다.',
        emotion: '피로',
        score: 74,
      },
      '월요일부터 비가 와서 그런가 오늘따라 너무 피곤하고 지치네. 그래도 오후에 잠깐 창밖 보면서 따뜻한 라떼 한 잔 마시니까 조금 살 것 같았다.'
    ),
  }),
]);
