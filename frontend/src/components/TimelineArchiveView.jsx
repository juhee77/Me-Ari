import React from 'react';

const CALENDAR_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function TimelineArchiveView({
  archives,
  selectedId,
  onSelectMemoir,
}) {
  const entryByDay = new Map();
  archives.forEach((entry) => {
    if (entry.dayOfMonth && !entryByDay.has(entry.dayOfMonth)) {
      entryByDay.set(entry.dayOfMonth, entry);
    }
  });

  return (
    <section className="meari-screen-timeline">
      <div className="meari-timeline-header">
        <div>
          <span className="meari-result-date">Memory Archive</span>
          <h2 className="meari-result-title">2026년 10월의 목소리 서재</h2>
        </div>

        <div className="meari-legend">
          <span className="meari-legend-item">
            <span className="meari-dot amber" /> 기쁨/설렘
          </span>
          <span className="meari-legend-item">
            <span className="meari-dot emerald" /> 평온/안도
          </span>
          <span className="meari-legend-item">
            <span className="meari-dot indigo" /> 피로/우울
          </span>
        </div>
      </div>

      <div className="meari-timeline-grid">
        {/* Left: Mood Calendar */}
        <div className="meari-calendar-card">
          <div className="meari-calendar-top">
            <span className="meari-calendar-title">10월 감정 캘린더</span>
            <span className="meari-model-tag">총 {archives.length}편의 목소리</span>
          </div>

          <div className="meari-weekdays">
            <span>일</span>
            <span>월</span>
            <span>화</span>
            <span>수</span>
            <span>목</span>
            <span>금</span>
            <span>토</span>
          </div>

          <div className="meari-days-grid">
            {/* Oct 1, 2026 is Thursday -> 4 empty cells */}
            <span />
            <span />
            <span />
            <span />
            {CALENDAR_DAYS.map((day) => {
              const matched = entryByDay.get(day);
              const isSelected = matched && matched.id === selectedId;
              const toneClass = matched ? `has-entry tone-${matched.toneColor}` : '';

              return (
                <button
                  key={day}
                  type="button"
                  disabled={!matched}
                  onClick={() => matched && onSelectMemoir(matched)}
                  className={`meari-day-cell ${toneClass} ${isSelected ? 'selected' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <p className="meari-calendar-tip">
            💡 색상이 표시된 날짜나 우측 일기 카드를 클릭하면 그날의 에세이와 그림을 펼쳐봅니다.
          </p>
        </div>

        {/* Right: Memoir Cards List */}
        <div className="meari-archive-list">
          {archives.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <article
                key={item.id}
                onClick={() => onSelectMemoir(item)}
                className={`meari-archive-item ${isSelected ? 'selected' : ''}`}
                role="button"
                tabIndex={0}
              >
                <div className="meari-archive-content">
                  <div className="meari-archive-meta">
                    <span className={`meari-emotion-pill tone-${item.toneColor}`}>
                      {item.emotionIcon} {item.emotion} {item.score}%
                    </span>
                    <span className="meari-archive-date">
                      {item.shortDate} • {item.durationLabel}
                    </span>
                  </div>
                  <h3 className="meari-archive-title balance-text">{item.title}</h3>
                  <p className="meari-archive-excerpt pretty-text">
                    {item.refinedText}
                  </p>
                </div>

                <div className="meari-archive-thumb">{item.emoji || '🌙'}</div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
