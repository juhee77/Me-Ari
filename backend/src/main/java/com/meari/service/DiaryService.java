package com.meari.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.meari.domain.Diary;
import com.meari.dto.DiaryResponse;
import com.meari.dto.DiarySaveRequest;
import com.meari.repository.DiaryRepository;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DiaryService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final DiaryRepository diaryRepository;
    private final StorageService storageService;
    private final String whisperUrl;
    private final String ollamaUrl;
    private final String ollamaModel;

    public DiaryService(
            DiaryRepository diaryRepository,
            StorageService storageService,
            @Value("${meari.ai.whisper-url:http://localhost:8000}") String whisperUrl,
            @Value("${meari.ai.ollama-url:http://localhost:11434}") String ollamaUrl,
            @Value("${meari.ai.ollama-model:gemma2:2b}") String ollamaModel
    ) {
        this.restClient = RestClient.create();
        this.objectMapper = new ObjectMapper();
        this.diaryRepository = diaryRepository;
        this.storageService = storageService;
        this.whisperUrl = whisperUrl;
        this.ollamaUrl = ollamaUrl;
        this.ollamaModel = ollamaModel;
    }

    @Transactional
    public DiaryResponse saveDiary(DiarySaveRequest request) {
        Diary diary = new Diary(
                request.title(),
                request.rawText(),
                request.refinedText(),
                request.emotion(),
                request.score(),
                request.audioUrl(),
                request.imageUrl()
        );
        Diary saved = diaryRepository.save(diary);
        return DiaryResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<DiaryResponse> getAllDiaries() {
        return diaryRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(DiaryResponse::from)
                .toList();
    }

    public String transcribeAudio(MultipartFile file) throws IOException {
        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        parts.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename() != null ? file.getOriginalFilename() : "audio.webm";
            }
        });

        String response = restClient.post()
                .uri(whisperUrl + "/api/transcribe")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(parts)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(response);
            return root.path("text").asText();
        } catch (Exception e) {
            return "Transcription failed: " + e.getMessage();
        }
    }

    public Map<String, Object> analyzeText(String rawText) {
        String prompt = "다음은 사용자의 음성 일기 원본입니다. 이를 자연스럽고 세련된 일기 형식으로 다듬어주고, 주요 감정 하나(예: 기쁨, 슬픔, 평온 등)와 그 감정의 강도(0~100)를 분석해주세요.\n\n"
                + "원본: " + rawText + "\n\n"
                + "출력은 반드시 JSON 형식으로 해주세요. 예시: {\"refinedText\": \"...\", \"emotion\": \"기쁨\", \"score\": 80}";

        Map<String, Object> requestBody = Map.of(
                "model", ollamaModel,
                "prompt", prompt,
                "stream", false,
                "format", "json"
        );

        try {
            String response = restClient.post()
                    .uri(ollamaUrl + "/api/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            String responseText = root.path("response").asText();

            JsonNode resultNode = objectMapper.readTree(responseText);
            return Map.of(
                    "refinedText", resultNode.path("refinedText").asText(),
                    "emotion", resultNode.path("emotion").asText(),
                    "score", resultNode.path("score").asInt()
            );
        } catch (Exception e) {
            return Map.of(
                    "refinedText", "Error refining text",
                    "emotion", "Unknown",
                    "score", 0
            );
        }
    }

    public Map<String, Object> generateIllustration(String text, String emotion) {
        String safeEmotion = (emotion != null && !emotion.isBlank()) ? emotion : "평온";
        Map<String, Object> requestBody = Map.of(
                "text", text,
                "emotion", safeEmotion
        );

        String svgContent = null;
        List<String> palette = List.of("#131829", "#473b54", "#d97706", "#fef3c7");
        String caption = "고요한 밤의 서재와 따뜻한 온기";

        try {
            String response = restClient.post()
                    .uri(whisperUrl + "/api/generate-image")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            if (root.has("svgContent")) {
                svgContent = root.path("svgContent").asText();
            }
            if (root.has("caption")) {
                caption = root.path("caption").asText();
            }
            if (root.has("palette") && root.path("palette").isArray()) {
                List<String> palList = new ArrayList<>();
                root.path("palette").forEach(node -> palList.add(node.asText()));
                palette = palList;
            }
        } catch (Exception e) {
            svgContent = String.format(
                    "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 400\"><rect width=\"400\" height=\"400\" fill=\"%s\"/><circle cx=\"288\" cy=\"96\" r=\"24\" fill=\"%s\"/><title>%s</title></svg>",
                    palette.get(0), palette.get(3), caption
            );
        }

        if (svgContent == null || svgContent.isBlank()) {
            svgContent = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 400\"><rect width=\"400\" height=\"400\" fill=\"#131829\"/></svg>";
        }

        String imageUrl = storageService.uploadImageBytes(
                svgContent.getBytes(StandardCharsets.UTF_8),
                "image/svg+xml",
                ".svg"
        );

        return Map.of(
                "imageUrl", imageUrl,
                "palette", palette,
                "caption", caption
        );
    }
}
