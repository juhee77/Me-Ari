import React, { useState, useCallback } from 'react';
import HeaderBar from './HeaderBar.jsx';
import MainStudyView from './MainStudyView.jsx';
import RecordingWaveView from './RecordingWaveView.jsx';
import ResultMemoirView from './ResultMemoirView.jsx';
import TimelineArchiveView from './TimelineArchiveView.jsx';
import { INITIAL_ARCHIVES } from '../data/initialArchives.js';
import { prependArchiveEntry } from '../utils/diaryHelpers.js';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder.js';

export default function AudioRecorder() {
  const [mood, setMood] = useState('midnight');
  const [activeScreen, setActiveScreen] = useState('main');
  const [archives, setArchives] = useState(INITIAL_ARCHIVES);
  const [currentMemoir, setCurrentMemoir] = useState(INITIAL_ARCHIVES[0]);

  const handleMemoirCompleted = useCallback((newEntry) => {
    setArchives((prev) => prependArchiveEntry(prev, newEntry));
    setCurrentMemoir(newEntry);
    setActiveScreen('result');
  }, []);

  const {
    isPaused,
    isProcessing,
    formattedTimer,
    waveBars,
    liveHint,
    errorMessage,
    startRecording,
    togglePause,
    stopRecording,
  } = useVoiceRecorder({ onMemoirCompleted: handleMemoirCompleted });

  const handleStartFromMain = (promptText = '') => {
    setActiveScreen('recording');
    startRecording(promptText);
  };

  const handleSelectMemoirFromTimeline = (entry) => {
    setCurrentMemoir(entry);
    setActiveScreen('result');
  };

  return (
    <div className={`meari-shell theme-${mood}`}>
      <div className="meari-container">
        <HeaderBar
          activeScreen={activeScreen}
          onSelectScreen={setActiveScreen}
          mood={mood}
          onChangeMood={setMood}
        />

        <main className="meari-main-stage">
          {activeScreen === 'main' && (
            <MainStudyView onStartRecording={handleStartFromMain} />
          )}

          {activeScreen === 'recording' && (
            <RecordingWaveView
              formattedTimer={formattedTimer}
              waveBars={waveBars}
              isPaused={isPaused}
              isProcessing={isProcessing}
              liveHint={liveHint}
              onTogglePause={togglePause}
              onCompleteRecording={stopRecording}
            />
          )}

          {activeScreen === 'result' && (
            <ResultMemoirView
              memoir={currentMemoir}
              noticeMessage={errorMessage}
              onRecordAgain={() => handleStartFromMain('')}
              onOpenTimeline={() => setActiveScreen('timeline')}
            />
          )}

          {activeScreen === 'timeline' && (
            <TimelineArchiveView
              archives={archives}
              selectedId={currentMemoir?.id}
              onSelectMemoir={handleSelectMemoirFromTimeline}
            />
          )}
        </main>
      </div>
    </div>
  );
}
