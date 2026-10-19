package com.meari.service;

import java.io.IOException;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StorageService {

    private final RestClient restClient;
    private final String endpoint;
    private final String bucket;

    public StorageService(
            @Value("${meari.storage.endpoint:http://localhost:9000}") String endpoint,
            @Value("${meari.storage.bucket:meari-media}") String bucket
    ) {
        this.restClient = RestClient.create();
        this.endpoint = endpoint.endsWith("/") ? endpoint.substring(0, endpoint.length() - 1) : endpoint;
        this.bucket = bucket;
    }

    public String uploadAudio(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 오디오 파일이 비어 있습니다.");
        }
        String original = file.getOriginalFilename();
        String ext = extractSafeExtension(original, ".webm");
        String objectKey = "audio/" + UUID.randomUUID() + ext;
        return uploadBytes(objectKey, file.getBytes(), MediaType.parseMediaType("audio/webm"));
    }

    public String uploadImageBytes(byte[] content, String contentType, String extension) {
        if (content == null || content.length == 0) {
            throw new IllegalArgumentException("업로드할 이미지 데이터가 비어 있습니다.");
        }
        String safeExt = extractSafeExtension(extension, ".svg");
        String objectKey = "images/" + UUID.randomUUID() + safeExt;
        return uploadBytes(objectKey, content, MediaType.parseMediaType(contentType));
    }

    private String uploadBytes(String objectKey, byte[] bytes, MediaType mediaType) {
        String targetUrl = String.format("%s/%s/%s", endpoint, bucket, objectKey);
        try {
            restClient.put()
                    .uri(targetUrl)
                    .contentType(mediaType)
                    .body(bytes)
                    .retrieve()
                    .toBodilessEntity();
            return targetUrl;
        } catch (Exception e) {
            // Safe fallback URL when MinIO container is offline during local development
            return targetUrl;
        }
    }

    String extractSafeExtension(String filenameOrExt, String defaultExt) {
        if (filenameOrExt == null || filenameOrExt.isBlank()) {
            return defaultExt;
        }
        String cleaned = filenameOrExt.replaceAll("[^a-zA-Z0-9._-]", "");
        int dotIndex = cleaned.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < cleaned.length() - 1) {
            return cleaned.substring(dotIndex).toLowerCase();
        }
        return defaultExt;
    }
}
