#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "========================================================"
echo "   🌙 Me-Ari (메아리) - 나의 페르소나, 보이스 메모아   "
echo "========================================================"

# 1. Ollama Check
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "🟢 [1/3] Ollama 서비스 연결 확인됨 (포트 11434)"
else
    echo "⚠️  [1/3] Ollama가 실행 중이지 않습니다. Mac 응용 프로그램에서 Ollama를 켜주세요."
fi

# 2. Start Python AI Service (Whisper & Image Gen)
echo "🚀 [2/3] 로컬 AI 음성 인식/일러스트 서비스 시작 중... (포트 8000)"
cd "$PROJECT_ROOT/ai-service"
"$PROJECT_ROOT/ai-service/venv/bin/uvicorn" main:app --port 8000 &
PID_AI=$!

# 3. Start Spring Boot Backend
echo "🚀 [3/3] Spring Boot 백엔드 서버 시작 중... (포트 8088)"
cd "$PROJECT_ROOT/backend"
./gradlew bootRun &
PID_BACKEND=$!

# Cleanup on exit (Ctrl+C)
cleanup() {
    echo ""
    echo "🛑 메아리 서비스를 안전하게 종료합니다..."
    kill "$PID_AI" 2>/dev/null || true
    kill "$PID_BACKEND" 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 4. Start React Frontend
echo ""
echo "✨ 프론트엔드 개발 서버를 실행합니다..."
cd "$PROJECT_ROOT/frontend"
npm run dev
