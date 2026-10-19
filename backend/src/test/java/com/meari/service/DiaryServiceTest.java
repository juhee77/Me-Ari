package com.meari.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.meari.dto.DiaryResponse;
import com.meari.dto.DiarySaveRequest;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class DiaryServiceTest {

    @Autowired
    private DiaryService diaryService;

    @Test
    void saveAndRetrieveDiariesInReverseChronologicalOrder() {
        DiarySaveRequest first = new DiarySaveRequest(
                "첫 번째 가을밤 일기",
                "오늘 진짜 바빴다.",
                "유난히 분주했던 하루를 무사히 마쳤다.",
                "평온",
                82,
                "http://localhost:9000/meari-media/audio-1.webm",
                "http://localhost:9000/meari-media/image-1.svg"
        );

        DiaryResponse saved = diaryService.saveDiary(first);
        assertNotNull(saved.id());
        assertEquals("첫 번째 가을밤 일기", saved.title());
        assertEquals("평온", saved.emotion());
        assertEquals(82, saved.score());

        List<DiaryResponse> all = diaryService.getAllDiaries();
        assertEquals(1, all.size());
        assertEquals(saved.id(), all.get(0).id());
    }
}
