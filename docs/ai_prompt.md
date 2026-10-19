# AI 개발을 위한 마스터 프롬프트 (Local AI 전용)

이 프롬프트를 AI에게 전달하면 로컬 모델 환경에 최적화된 프로젝트의 뼈대를 잡아줄 수 있습니다.

## [프롬프트 복사하기]

> "나는 '목소리 일기' 웹 서비스를 개발하려고 해. 백엔드는 **Java Spring Boot**, 프런트엔드는 **React**를 사용할 거야. 이 서비스의 핵심은 사용자가 음성으로 하루를 말하면, 로컬 AI가 이를 세련된 일기로 다듬고 감정을 분석하며 관련 이미지를 생성해 주는 거야. 
> 
> 다음 단계에 따라 개발 가이드를 작성해 줘:
> 
> 1. **데이터베이스 설계**: 유저 정보, 일기 내용(원본/교정본), 감정 태그, 파일 경로(MinIO)를 포함한 ERD 설계.
> 2. **백엔드 API 구조**: 
>    - `/api/diary/upload`: 음성 파일 수신 및 **Local Whisper (tiny)** 연동 로직.
>    - `/api/diary/analyze`: **Ollama (Gemma 2 2B / Llama 3.2)**를 활용한 텍스트 교정 및 감정 분석 로직.
>    - `/api/diary/image`: **Local Stable Diffusion (SDXL Lightning)**을 활용한 이미지 생성 요청 로직.
> 3. **프런트엔드 핵심 코드**: React에서 `MediaRecorder API`를 사용하여 음성을 녹음하고 서버로 전송하는 기본 컴포넌트 예시.
> 4. **로컬 AI 연동**: 백엔드에서 Ollama API(localhost:11434) 및 로컬 모델 서버와 통신하는 방식.
> 
> 우선 백엔드의 전체적인 패키지 구조와 `DiaryController`의 기본 골격을 Java 코드로 작성해 줘."
