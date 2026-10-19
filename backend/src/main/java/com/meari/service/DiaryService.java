package com.meari.service;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Map;

@Service
public class DiaryService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public DiaryService(ObjectMapper objectMapper) {
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper;
    }

    public String transcribeAudio(MultipartFile file) throws IOException {
        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        parts.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename() != null ? file.getOriginalFilename() : "audio.webm";
            }
        });

        // Call FastAPI Whisper proxy
        String response = restClient.post()
                .uri("http://localhost:8000/api/transcribe")
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
                "model", "gemma2:2b",
                "prompt", prompt,
                "stream", false,
                "format", "json"
        );

        try {
            // Call local Ollama API
            String response = restClient.post()
                    .uri("http://localhost:11434/api/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            String responseText = root.path("response").asText();
            
            // The response itself should be a JSON string due to format: json
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
}
