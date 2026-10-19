package com.meari.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class StorageServiceTest {

    private final StorageService storageService =
            new StorageService("http://localhost:9000", "meari-media");

    @Test
    void uploadAudioReturnsMinioObjectUrlWithSanitizedExtension() throws Exception {
        MockMultipartFile mockAudio = new MockMultipartFile(
                "audio",
                "my-voice.webm",
                "audio/webm",
                "dummy-audio-bytes".getBytes(StandardCharsets.UTF_8)
        );

        String url = storageService.uploadAudio(mockAudio);
        assertTrue(url.startsWith("http://localhost:9000/meari-media/audio/"));
        assertTrue(url.endsWith(".webm"));
    }

    @Test
    void uploadAudioRejectsEmptyFile() {
        MockMultipartFile emptyAudio = new MockMultipartFile(
                "audio",
                "empty.webm",
                "audio/webm",
                new byte[0]
        );

        assertThrows(IllegalArgumentException.class, () -> storageService.uploadAudio(emptyAudio));
    }

    @Test
    void extractSafeExtensionStripsUnsafeCharacters() {
        assertEquals(".webm", storageService.extractSafeExtension("../../recording.WEBM", ".wav"));
        assertEquals(".svg", storageService.extractSafeExtension(null, ".svg"));
    }
}
