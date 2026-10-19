package com.meari.controller;

import com.meari.dto.DiaryResponse;
import com.meari.dto.DiarySaveRequest;
import com.meari.service.DiaryService;
import com.meari.service.StorageService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/diary")
public class DiaryController {

    private final DiaryService diaryService;
    private final StorageService storageService;

    public DiaryController(DiaryService diaryService, StorageService storageService) {
        this.diaryService = diaryService;
        this.storageService = storageService;
    }

    @GetMapping
    public ResponseEntity<List<DiaryResponse>> getAllDiaries() {
        return ResponseEntity.ok(diaryService.getAllDiaries());
    }

    @PostMapping
    public ResponseEntity<DiaryResponse> saveDiary(@Valid @RequestBody DiarySaveRequest request) {
        DiaryResponse saved = diaryService.saveDiary(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadAudio(@RequestParam("audio") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Audio file is required"));
        }
        try {
            String audioUrl = storageService.uploadAudio(file);
            String transcribedText = diaryService.transcribeAudio(file);
            return ResponseEntity.ok(Map.of(
                    "message", "Audio uploaded and transcribed successfully",
                    "text", transcribedText,
                    "audioUrl", audioUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to process audio upload"));
        }
    }

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeText(@RequestBody Map<String, String> payload) {
        String rawText = payload.get("text");
        if (rawText == null || rawText.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text is required"));
        }

        Map<String, Object> result = diaryService.analyzeText(rawText);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/image")
    public ResponseEntity<Map<String, Object>> generateImage(@RequestBody Map<String, String> payload) {
        String text = payload.get("text");
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text is required"));
        }

        String emotion = payload.getOrDefault("emotion", "평온");
        Map<String, Object> result = diaryService.generateIllustration(text, emotion);
        return ResponseEntity.ok(result);
    }
}
