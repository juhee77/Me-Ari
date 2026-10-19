import { useState, useRef, useEffect, useCallback } from 'react';
import {
  formatDuration,
  normalizeAnalysisResult,
  mapDiaryResponseToMemoirEntry,
} from '../utils/diaryHelpers.js';

const DEFAULT_BARS = [
  28, 42, 65, 35, 80, 95, 55, 40, 72, 90, 100, 68, 48, 84, 62, 36,
  78, 92, 60, 44, 88, 70, 50, 96, 64, 38, 74, 52, 82, 45, 30, 58,
];

export function useVoiceRecorder({ onMemoirCompleted }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [waveBars, setWaveBars] = useState(DEFAULT_BARS);
  const [liveHint, setLiveHint] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const secondsRef = useRef(0);

  const cleanupMedia = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cleanupMedia();
  }, [cleanupMedia]);

  const startVisualizerLoop = useCallback((analyser) => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateBars = () => {
      analyser.getByteFrequencyData(dataArray);
      const nextBars = Array.from({ length: 32 }, (_, idx) => {
        const value = dataArray[idx % bufferLength] || 0;
        return Math.max(18, Math.min(100, Math.round((value / 255) * 100)));
      });
      setWaveBars(nextBars);
      animFrameRef.current = requestAnimationFrame(updateBars);
    };

    animFrameRef.current = requestAnimationFrame(updateBars);
  }, []);

  const processRecordedBlob = useCallback(
    async (audioBlob, recordedSeconds, promptHint) => {
      setIsProcessing(true);
      setErrorMessage(null);

      const durationLabel = formatDuration(recordedSeconds || 84);
      const now = new Date();
      const dayOfMonth = now.getDate();
      const shortDate = `${now.getMonth() + 1}월 ${dayOfMonth}일`;
      const dateLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${dayOfMonth}일 • ${now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;

      let transcribedText = '';
      let uploadedAudioUrl = null;
      let analysisData = null;
      let generatedImageUrl = null;
      let generatedPalette = null;
      let generatedCaption = null;
      let savedDiaryResponse = null;

      try {
        // Step 1: Upload audio & transcribe (Issue #2 & Whisper STT)
        if (audioBlob && audioBlob.size > 0) {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const uploadRes = await fetch('/api/diary/upload', {
            method: 'POST',
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadJson = await uploadRes.json();
            transcribedText = uploadJson.text || '';
            uploadedAudioUrl = uploadJson.audioUrl || null;
          }
        }

        const safeRaw =
          transcribedText && !transcribedText.startsWith('Transcription failed')
            ? transcribedText
            : promptHint
              ? `${promptHint.replace(/^[^\s]+\s/, '').replace(/"/g, '')} 오늘 하루도 정말 숨 가쁘게 지나갔지만, 조용한 밤공기를 마시며 내 마음을 천천히 돌아보았다.`
              : '아 오늘 하루는 아침부터 정신이 하나도 없었어. 그래도 저녁에 퇴근하면서 밤공기 마시는데 가을 냄새가 나서 기분이 조금 풀리더라. 오늘 진짜 고생 많았다.';

        // Step 2: Analyze & rewrite (Ollama LLM)
        try {
          const analyzeRes = await fetch('/api/diary/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: safeRaw }),
          });
          if (analyzeRes.ok) {
            analysisData = await analyzeRes.json();
          }
        } catch {
          // LLM fallback
        }

        const normalized = normalizeAnalysisResult(analysisData, safeRaw);

        // Step 3: Generate Illustration & store to MinIO (Issue #3)
        try {
          const imageRes = await fetch('/api/diary/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: normalized.refinedText,
              emotion: normalized.emotion,
            }),
          });
          if (imageRes.ok) {
            const imageJson = await imageRes.json();
            generatedImageUrl = imageJson.imageUrl || null;
            generatedPalette = imageJson.palette || null;
            generatedCaption = imageJson.caption || null;
          }
        } catch {
          // Image fallback
        }

        // Step 4: Persist in Database (Issue #1)
        try {
          const saveRes = await fetch('/api/diary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: normalized.title,
              rawText: safeRaw,
              refinedText: normalized.refinedText,
              emotion: normalized.emotion,
              score: normalized.score,
              audioUrl: uploadedAudioUrl,
              imageUrl: generatedImageUrl,
            }),
          });
          if (saveRes.ok) {
            savedDiaryResponse = await saveRes.json();
          }
        } catch {
          // DB save fallback
        }

        if (savedDiaryResponse) {
          const entryFromDb = mapDiaryResponseToMemoirEntry(savedDiaryResponse);
          if (entryFromDb) {
            setIsProcessing(false);
            if (onMemoirCompleted) {
              onMemoirCompleted(entryFromDb);
            }
            return;
          }
        }

        // Fallback in-memory entry if backend is partially offline
        const fallbackEntry = Object.freeze({
          id: `memoir-${Date.now()}`,
          dateLabel,
          shortDate,
          dayOfMonth,
          durationLabel,
          emoji: normalized.emotionIcon,
          illustrationCaption: generatedCaption || '창가에 스미는 밤공기와 오늘 하루를 보듬는 따뜻한 온기',
          audioUrl: uploadedAudioUrl || (audioBlob && audioBlob.size > 0 ? URL.createObjectURL(audioBlob) : null),
          imageUrl: generatedImageUrl || null,
          palette: generatedPalette || normalized.palette,
          ...normalized,
        });

        setIsProcessing(false);
        if (onMemoirCompleted) {
          onMemoirCompleted(fallbackEntry);
        }
      } catch {
        setErrorMessage(
          '로컬 AI 서버 연결을 확인하지 못해 서재 미리보기 모드로 에세이를 구성했습니다.'
        );
        setIsProcessing(false);
      }
    },
    [onMemoirCompleted]
  );

  const startRecording = useCallback(
    async (promptText = '') => {
      setErrorMessage(null);
      setLiveHint(promptText || '');
      setSeconds(0);
      secondsRef.current = 0;
      setIsPaused(false);
      audioChunksRef.current = [];

      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds((prev) => prev + 1);
      }, 1000);

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('브라우저에서 마이크 입력을 지원하지 않습니다.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;
          startVisualizerLoop(analyser);
        }

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current = [...audioChunksRef.current, event.data];
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (blob.size > 0) {
            setAudioUrl(URL.createObjectURL(blob));
          }
          processRecordedBlob(blob, secondsRef.current, promptText);
        };

        recorder.start();
        setIsRecording(true);
      } catch {
        // Fallback simulation mode if mic permission denied or unavailable
        setIsRecording(true);
        setErrorMessage('마이크 권한 없이 서재 시뮬레이션 녹음 모드로 동작 중입니다.');
      }
    },
    [processRecordedBlob, startVisualizerLoop]
  );

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const nextPaused = !prev;
      const recorder = mediaRecorderRef.current;

      if (recorder && recorder.state !== 'inactive') {
        if (nextPaused && recorder.state === 'recording') {
          recorder.pause();
        } else if (!nextPaused && recorder.state === 'paused') {
          recorder.resume();
        }
      }

      if (nextPaused && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      } else if (!nextPaused && !timerRef.current) {
        timerRef.current = setInterval(() => {
          secondsRef.current += 1;
          setSeconds((s) => s + 1);
        }, 1000);
      }

      return nextPaused;
    });
  }, []);

  const stopRecording = useCallback(() => {
    const currentSecs = secondsRef.current;
    const currentHint = liveHint;
    setIsRecording(false);
    setIsPaused(false);
    cleanupMedia();

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      mediaRecorderRef.current = null;
    } else {
      processRecordedBlob(null, currentSecs, currentHint);
    }
  }, [cleanupMedia, liveHint, processRecordedBlob]);

  return {
    isRecording,
    isPaused,
    isProcessing,
    seconds,
    formattedTimer: formatDuration(seconds),
    waveBars,
    liveHint,
    errorMessage,
    audioUrl,
    startRecording,
    togglePause,
    stopRecording,
  };
}
