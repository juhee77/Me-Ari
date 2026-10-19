package com.meari.controller;

import com.meari.service.DiaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/diary")
public class DiaryController {

    private final DiaryService diaryService;

    public DiaryController(DiaryService diaryService) {
        this.diaryService = diaryService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadAudio(@RequestParam("audio") MultipartFile file) {
        try {
            String transcribedText = diaryService.transcribeAudio(file);
            return ResponseEntity.ok(Map.of("message", "Audio transcribed successfully", "text", transcribedText));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
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
    public ResponseEntity<Map<String, String>> generateImage(@RequestBody Map<String, String> payload) {
        // TODO: Call Local Stable Diffusion (SDXL Lightning) via Python proxy (to be implemented later)
        return ResponseEntity.ok(Map.of("imageUrl", "http://localhost:9000/generated-images/sample.png"));
    }
}
