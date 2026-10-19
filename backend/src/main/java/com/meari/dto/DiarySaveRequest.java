package com.meari.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DiarySaveRequest(
        @NotBlank(message = "제목은 필수입니다.")
        @Size(max = 120, message = "제목은 120자 이하여야 합니다.")
        String title,

        @NotBlank(message = "원본 텍스트는 필수입니다.")
        String rawText,

        @NotBlank(message = "교정된 에세이 본문은 필수입니다.")
        String refinedText,

        @NotBlank(message = "감정 태그는 필수입니다.")
        @Size(max = 40, message = "감정 태그는 40자 이하여야 합니다.")
        String emotion,

        @Min(value = 0, message = "감정 점수는 0 이상이어야 합니다.")
        @Max(value = 100, message = "감정 점수는 100 이하여야 합니다.")
        int score,

        String audioUrl,

        String imageUrl
) {
}
