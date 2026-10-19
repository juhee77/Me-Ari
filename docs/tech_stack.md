# 기술 스택 (Tech Stack)

맥 환경에서의 개발과 접근성을 고려한 최적의 조합입니다.

## 1. Backend
*   **Java Spring Boot 3.x**
*   **DB**: MySQL 또는 PostgreSQL (일기 및 감정 데이터 저장)
*   **Storage**: MinIO (S3 호환 로컬/자가 호스팅 스토리지)

## 2. Frontend
*   **React** (Vite 사용 권장)
*   `Web Audio API`를 이용한 음성 녹음 및 시각화.

## 3. AI Models (API 연동)
*   **STT**: Local Whisper (tiny-model) - 초경량/고속 음성 인식
*   **LLM**: Ollama (Llama 3.2 3B 또는 Gemma 2 2B) - 로컬 실행 초경량 모델
*   **Image**: Local Stable Diffusion (SDXL Lightning) - 고속 이미지 생성

## 4. Infrastructure
*   **Docker**: 맥 환경에서 일관된 개발 환경 유지
