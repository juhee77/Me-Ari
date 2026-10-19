import React, { useState, useRef } from 'react';

export default function ResultMemoirView({
  memoir,
  noticeMessage,
  onRecordAgain,
  onOpenTimeline,
}) {
  const [textMode, setTextMode] = useState('refined');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  if (!memoir) {
    return null;
  }

  const handleToggleAudio = () => {
    if (!audioRef.current) {
      setIsPlayingAudio((prev) => !prev);
      return;
    }
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  return (
    <section className="meari-screen-result">
      {noticeMessage && (
        <div className="meari-notice-banner" role="status">
          <span>💡 {noticeMessage}</span>
        </div>
      )}

      {/* Top Status & Title Bar */}
      <div className="meari-result-topbar">
        <div>
          <span className="meari-result-date">{memoir.dateLabel}</span>
          <h2 className="meari-result-title balance-text">{memoir.title}</h2>
        </div>

        <div className="meari-result-actions">
          <button
            type="button"
            onClick={onRecordAgain}
            className="meari-btn-ghost"
          >
            🎙 다시 녹음하기
          </button>
          <button
            type="button"
            onClick={onOpenTimeline}
            className="meari-btn-accent"
          >
            📚 서재 타임라인 보기
          </button>
        </div>
      </div>

      {/* Split Layout: Left Essay (7 cols) / Right Illustration (5 cols) */}
      <div className="meari-result-grid">
        {/* LEFT: AI Refined Diary Card */}
        <article className="meari-essay-card">
          <div>
            <div className="meari-essay-toolbar">
              <div className="meari-seg-control">
                <button
                  type="button"
                  onClick={() => setTextMode('refined')}
                  className={`meari-seg-btn ${textMode === 'refined' ? 'active' : ''}`}
                >
                  ✨ AI 다듬은 에세이
                </button>
                <button
                  type="button"
                  onClick={() => setTextMode('raw')}
                  className={`meari-seg-btn ${textMode === 'raw' ? 'active' : ''}`}
                >
                  🎙 원본 음성 텍스트
                </button>
              </div>
              <span className="meari-model-tag">Gemma 2 (2B) 교정 완료</span>
            </div>

            {textMode === 'refined' ? (
              <div className="meari-essay-body pretty-text">
                {memoir.paragraphs.map((paragraph, index) => (
                  <p key={index} className="meari-essay-paragraph">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="meari-raw-box pretty-text">
                <p className="meari-raw-label">
                  원본 음성 인식 기록 (Whisper STT):
                </p>
                <p>"{memoir.rawText}"</p>
              </div>
            )}
          </div>

          {/* Bottom Voice Replay Mini Bar */}
          <div className="meari-audio-footer">
            <div className="meari-audio-player-info">
              <button
                type="button"
                onClick={handleToggleAudio}
                className="meari-play-circle"
                aria-label={isPlayingAudio ? '일시정지' : '원본 목소리 재생'}
              >
                {isPlayingAudio ? '⏸' : '▶'}
              </button>
              <div>
                <p className="meari-audio-title">오늘의 목소리 원본 다시 듣기</p>
                <p className="meari-audio-sub">
                  {memoir.durationLabel} • MinIO Local Storage 보관됨
                </p>
              </div>
              {memoir.audioUrl && (
                <audio
                  ref={audioRef}
                  src={memoir.audioUrl}
                  onEnded={() => setIsPlayingAudio(false)}
                />
              )}
            </div>

            <div className="meari-tag-row">
              {(memoir.tags || ['#가을밤', '#퇴근길', '#안도감']).map((tag) => (
                <span key={tag} className="meari-hashtag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </article>

        {/* RIGHT: AI Generated Illustration Card */}
        <aside className="meari-illust-card">
          <div>
            <div className="meari-illust-header">
              <span className="meari-illust-badge">🎨 오늘의 기억 일러스트</span>
              <span className="meari-model-tag">SDXL Lightning</span>
            </div>

            <div className="meari-illust-frame">
              {memoir.imageUrl ? (
                <img
                  src={memoir.imageUrl}
                  alt={memoir.illustrationCaption}
                  className="meari-illust-svg"
                  onError={(e) => {
                    // Gracefully hide broken img and show svg fallback
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <svg viewBox="0 0 400 400" className="meari-illust-svg">
                  <defs>
                    <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={memoir.palette?.[0] || '#131829'} />
                      <stop offset="55%" stopColor="#252b48" />
                      <stop offset="100%" stopColor={memoir.palette?.[1] || '#473b54'} />
                    </linearGradient>
                    <radialGradient id="moonGlow" cx="0.72" cy="0.24" r="0.35">
                      <stop offset="0%" stopColor="#f6d592" stopOpacity="0.95" />
                      <stop offset="35%" stopColor="#e0a96d" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#e0a96d" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="windowLight" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fbd38d" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#dd6b20" stopOpacity="0.45" />
                    </linearGradient>
                  </defs>
                  <rect width="400" height="400" fill="url(#nightSky)" />
                  <circle cx="288" cy="96" r="120" fill="url(#moonGlow)" />
                  <circle cx="288" cy="96" r="24" fill="#fef3c7" />
                  <circle cx="70" cy="65" r="1.5" fill="#fef3c7" opacity="0.7" />
                  <circle cx="140" cy="48" r="1.2" fill="#fef3c7" opacity="0.5" />
                  <circle cx="195" cy="92" r="1.8" fill="#fef3c7" opacity="0.6" />
                  <circle cx="95" cy="130" r="1.2" fill="#fef3c7" opacity="0.4" />
                  <path
                    d="M0 290 Q110 245 230 285 T400 275 L400 400 L0 400 Z"
                    fill="#1e2236"
                  />
                  <path
                    d="M0 320 Q160 285 310 315 T400 310 L400 400 L0 400 Z"
                    fill="#151826"
                  />
                  <rect
                    x="52"
                    y="210"
                    width="84"
                    height="110"
                    rx="6"
                    fill="#10131e"
                    stroke="#e0a96d"
                    strokeWidth="2"
                    strokeOpacity="0.5"
                  />
                  <rect x="60" y="218" width="30" height="44" fill="url(#windowLight)" rx="2" />
                  <rect x="96" y="218" width="30" height="44" fill="url(#windowLight)" rx="2" />
                  <rect x="60" y="268" width="30" height="44" fill="url(#windowLight)" rx="2" />
                  <rect x="96" y="268" width="30" height="44" fill="url(#windowLight)" rx="2" />
                  <path
                    d="M400 160 Q320 185 265 170 M340 175 Q300 205 275 215"
                    stroke="#0f121c"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="265" cy="170" r="9" fill="#d97706" opacity="0.85" />
                  <circle cx="295" cy="182" r="7" fill="#b45309" opacity="0.8" />
                  <circle cx="242" cy="212" r="5" fill="#f59e0b" opacity="0.75" />
                  <circle cx="205" cy="248" r="4.5" fill="#d97706" opacity="0.7" />
                  <path
                    d="M168 338 Q172 322 166 312 M180 336 Q184 320 178 310"
                    stroke="#fde68a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.55"
                  />
                  <rect x="160" y="342" width="28" height="18" rx="4" fill="#e0a96d" />
                </svg>
              )}

              <div className="meari-illust-overlay">
                <p>"{memoir.illustrationCaption}"</p>
              </div>
            </div>
          </div>

          <div className="meari-palette-footer">
            <span className="meari-model-tag">오늘의 감성 컬러칩</span>
            <div className="meari-swatches">
              {(memoir.palette || ['#131829', '#473b54', '#d97706', '#fef3c7']).map(
                (hex) => (
                  <span
                    key={hex}
                    className="meari-swatch"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                )
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* BOTTOM: Emotion & Voice Tone Report */}
      <div className="meari-emotion-report">
        <div className="meari-emotion-summary">
          <span className="meari-report-badge">📊 AI 감정 및 목소리 톤 리포트</span>
          <h3 className="meari-report-headline balance-text">
            {memoir.commentary}
          </h3>
          <p className="meari-report-detail pretty-text">{memoir.detail}</p>
        </div>

        <div className="meari-stat-cards">
          {memoir.stats.map((stat) => (
            <div key={stat.label} className="meari-stat-card">
              <div className="meari-stat-top">
                <span>{stat.label}</span>
                <strong className={`tone-${stat.barColor}`}>{stat.value}%</strong>
              </div>
              <div className="meari-stat-track">
                <div
                  className={`meari-stat-fill fill-${stat.barColor}`}
                  style={{ width: `${stat.value}%` }}
                />
              </div>
              <p className="meari-stat-note">{stat.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
