# '목소리 일기' 개발 계획 (Local AI 최적화)

본 문서는 프로젝트 '목소리 일기'를 로컬 AI 환경(Ollama, Whisper-tiny, SDXL Lightning)에 맞춰 재설계한 개발 로드맵입니다. 맥(M1/M2/M3) 환경에서 최상의 퍼포먼스를 낼 수 있도록 구성했습니다.

## Phase 1: 로컬 AI 서버 및 음성 인식 (The "Ear")
**목표**: 로컬 환경에서 음성을 텍스트로 변환하고 데이터를 저장하는 기반 완성

1.  **로컬 AI 인프라 구축**:
    *   **Ollama 설치**: `gemma2:2b` 또는 `llama3.2` 모델 확보 (초경량/고성능)
    *   **Local AI Proxy (Python/FastAPI)**: `Faster-Whisper` (tiny 모델)를 서빙하는 간단한 마이크로서비스 구축
2.  **Spring Boot 백엔드 초기화**:
    *   Multipart 파일 업로그 및 로컬 API 프록시 호출 로직 구현
    *   **MinIO** 기반 로컬 S3 호환 스토리지 설정 (음성 파일 저장)

## Phase 2: 로컬 LLM 기반 문장 고도화 (The "Brain")
**목표**: 로컬 LLM을 통한 일기 교정 및 감정 분석 기능 통합

1.  **Smart Rewriting**:
    *   Ollama API(`localhost:11434`) 연동: STT 결과물을 세련된 말투로 정제
    *   경량 모델(2B-3B)에 최적화된 프롬프트 엔지니어링 (Few-shot prompting)
2.  **감정 분석**:
    *   텍스트에서 주요 감정(기쁨, 우울 등) 수치화 및 DB 저장
3.  **UI/UX**:
    *   녹음 중 보이스 비주얼라이저(Web Audio API) 및 로딩 애니메이션 구현

## Phase 3: 로컬 이미지 생성 및 타임라인 (The "Eye")
**목표**: 고속 로컬 이미지 생성을 통한 시각적 가치 부여

1.  **AI 일러스트 생성**:
    *   Local AI Proxy에 **SDXL Lightning (1-step/4-step)** 모델 추가
    *   일기 내용을 요약하여 프롬프트 생성 후 이미지 고속 생성 및 MinIO 저장
2.  **타임라인**:
    *   캘린더 대시보드에서 목소리, 글, 그림을 한눈에 확인하는 기능 완성

## Phase 4: 최적화 및 컨테이너화
**목표**: 자원 관리 최적화 및 배포 준비

1.  **메모리 최적화**:
    *   Mac Unified Memory 환경에 맞춰 모델 양자화(Q4_K_M 등) 설정
    *   사용하지 않는 모델 언로드(Unload) 전략 수립
2.  **Docker Compose 완성**:
    *   Spring Boot, PostgreSQL, Minio, Local AI Proxy를 한 번에 실행하는 구성

---

### 첫 번째 스텝 추천
먼저 **Ollama**를 설치하여 `gemma2:2b` 모델이 잘 돌아가는지 확인하고, 번거롭지 않게 Python 기반의 **Whisper API** 서버를 먼저 띄워보는 것이 좋습니다.
