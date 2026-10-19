import React from 'react';

const NAV_TABS = Object.freeze([
  { id: 'main', label: '① 메인 (녹음 대기)' },
  { id: 'recording', label: '② 녹음 중 (파형)' },
  { id: 'result', label: '③ 결과 (에세이 & 그림)' },
  { id: 'timeline', label: '④ 서재 타임라인' },
]);

export default function HeaderBar({
  activeScreen,
  onSelectScreen,
  mood,
  onChangeMood,
}) {
  return (
    <header className="meari-header">
      <div className="meari-header-inner">
        {/* Brand Logo */}
        <div className="meari-brand" onClick={() => onSelectScreen('main')} role="button" tabIndex={0}>
          <div className="meari-brand-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <div>
            <div className="meari-brand-title-row">
              <span className="meari-brand-ko">메아리</span>
              <span className="meari-brand-en">Me-Ari</span>
            </div>
            <p className="meari-brand-sub">나의 페르소나, 보이스 메모아</p>
          </div>
        </div>

        {/* Navigation Step Switcher */}
        <nav className="meari-nav" aria-label="서재 화면 이동">
          {NAV_TABS.map((tab) => {
            const isActive = activeScreen === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectScreen(tab.id)}
                className={`meari-nav-btn ${isActive ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Mood Theme Switcher */}
        <div className="meari-mood-switcher">
          <button
            type="button"
            onClick={() => onChangeMood('midnight')}
            className={`meari-mood-btn ${mood === 'midnight' ? 'active' : ''}`}
          >
            🌙 깊은 밤의 서재
          </button>
          <button
            type="button"
            onClick={() => onChangeMood('pastel')}
            className={`meari-mood-btn ${mood === 'pastel' ? 'active' : ''}`}
          >
            🌅 차분한 파스텔
          </button>
        </div>
      </div>
    </header>
  );
}
