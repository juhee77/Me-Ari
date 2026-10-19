package com.meari.dto;

import com.meari.domain.Diary;
import java.time.LocalDateTime;

public record DiaryResponse(
        Long id,
        String title,
        String rawText,
        String refinedText,
        String emotion,
        int score,
        String audioUrl,
        String imageUrl,
        LocalDateTime createdAt
) {
    public static DiaryResponse from(Diary diary) {
        return new DiaryResponse(
                diary.getId(),
                diary.getTitle(),
                diary.getRawText(),
                diary.getRefinedText(),
                diary.getEmotion(),
                diary.getScore(),
                diary.getAudioUrl(),
                diary.getImageUrl(),
                diary.getCreatedAt()
        );
    }
}
