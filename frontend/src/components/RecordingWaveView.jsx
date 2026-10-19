import React from 'react';

export default function RecordingWaveView({
  formattedTimer,
  waveBars,
  isPaused,
  isProcessing,
  liveHint,
  onTogglePause,
  onCompleteRecording,
}) {
  return (
    <section className="meari-screen-recording">
      <div className="meari-rec-status-pill">
        <span className={`meari-rec-dot ${isPaused ? 'paused' : ''}`} />
        <span>
          {isProcessing
            ? 'AI가 목소리를 에세이로 다듬고 있어요...'
            : isPaused
              ? '녹음이 잠시 멈추어 있습니다'
              : '귀 기울여 듣고 있어요'}
        </span>
      </div>

      {/* Timer */}
      <div className="meari-rec-timer">{formattedTimer}</div>
      <p className="meari-rec-subtitle">
        천천히 생각나는 대로 말씀해 주세요. 침묵도 자연스럽게 다듬어집니다.
      </p>

      {/* Dynamic Waveform Visualizer Box */}
      <div className="meari-waveform-card">
        <div className="meari-waveform-bars" aria-hidden="true">
          {waveBars.map((height, idx) => (
            <div
              key={idx}
              className={`meari-wave-bar ${isPaused ? 'paused' : ''}`}
              style={{
                height: `${height}%`,
                backgroundColor:
                  idx % 3 === 0 ? 'var(--m-accent)' : 'var(--m-secondary)',
                animationDelay: `${(idx * 0.07).toFixed(2)}s`,
              }}
            />
          ))}
        </div>

        {/* Live Whisper STT Preview Caption */}
        <div className="meari-stt-preview">
          <div className="meari-stt-header">
            <span>실시간 음성 메모 (Local Whisper-tiny)</span>
            <span>{isPaused ? '일시정지됨' : '한국어 음성 감지 중...'}</span>
          </div>
          <p className="meari-stt-text pretty-text">
            {liveHint
              ? `${liveHint} 주제로 오늘의 이야기를 들려주시는 중입니다...`
              : '"오늘 하루 있었던 일과 떠오르는 감정들을 편하게 들려주세요. 녹음을 마치면 로컬 Whisper와 Gemma 2가 에세이로 정돈해 드립니다..."'}
            <span className="meari-stt-cursor" />
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="meari-rec-controls">
        <button
          type="button"
          onClick={onTogglePause}
          disabled={isProcessing}
          className="meari-btn-secondary"
        >
          <span>{isPaused ? '▶' : '⏸'}</span>
          <span>{isPaused ? '이어서 녹음' : '잠시 멈춤'}</span>
        </button>

        <button
          type="button"
          onClick={onCompleteRecording}
          disabled={isProcessing}
          className="meari-btn-primary"
        >
          <span>
            {isProcessing ? '⏳ AI 에세이 생성 중...' : '✨ 이야기 마치기 (일기 완성)'}
          </span>
        </button>
      </div>
    </section>
  );
}
