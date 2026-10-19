package com.meari.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "diaries")
public class Diary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String rawText;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String refinedText;

    @Column(nullable = false, length = 40)
    private String emotion;

    @Column(nullable = false)
    private int score;

    @Column(length = 500)
    private String audioUrl;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected Diary() {
    }

    public Diary(
            String title,
            String rawText,
            String refinedText,
            String emotion,
            int score,
            String audioUrl,
            String imageUrl
    ) {
        this.title = title;
        this.rawText = rawText;
        this.refinedText = refinedText;
        this.emotion = emotion;
        this.score = score;
        this.audioUrl = audioUrl;
        this.imageUrl = imageUrl;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getRawText() {
        return rawText;
    }

    public String getRefinedText() {
        return refinedText;
    }

    public String getEmotion() {
        return emotion;
    }

    public int getScore() {
        return score;
    }

    public String getAudioUrl() {
        return audioUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
