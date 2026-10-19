import React from 'react';
import { PROMPT_STARTERS } from '../data/initialArchives.js';

export default function MainStudyView({ onStartRecording }) {
  return (
    <section className="meari-screen-main">
      <div className="meari-pill-badge">
        <span>🕯️ Deep Night Study</span>
        <span>•</span>
        <span>조용히 나를 마주하는 시간</span>
      </div>

      <h1 className="meari-hero-title balance-text">오늘 하루는 어땠나요?</h1>
      <p className="meari-hero-subtitle pretty-text">
        쓰지 말고 편하게 말해보세요. 두서없는 혼잣말도 괜찮아요.
        <br />
        AI가 당신의 목소리를 한 편의 에세이와 한 장의 그림으로 남겨드립니다.
      </p>

      {/* Central Microphone Orb with Breathing Ripples */}
      <div className="meari-orb-wrapper">
        <div className="meari-orb-ring outer" />
        <div className="meari-orb-ring inner" />

        <button
          type="button"
          onClick={() => onStartRecording('')}
          className="meari-orb-btn"
          aria-label="음성 일기 녹음 시작"
        >
          <svg
            width="36"
            height="36"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
            />
          </svg>
          <span>이야기 시작</span>
        </button>
      </div>

      <p className="meari-orb-caption">
        마이크 아이콘을 누르면 실시간 목소리 기록이 시작됩니다
      </p>

      {/* Conversation Starter Prompts */}
      <div className="meari-prompts-box">
        <p className="meari-prompts-label">어떤 말부터 꺼낼지 고민된다면</p>
        <div className="meari-prompts-list">
          {PROMPT_STARTERS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onStartRecording(prompt)}
              className="meari-prompt-chip"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
