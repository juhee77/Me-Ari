from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from faster_whisper import WhisperModel
import os
import tempfile

app = FastAPI(title="Me-Ari Local AI Proxy")

model_size = "tiny"
model = WhisperModel(model_size, device="cpu", compute_type="int8")


class ImageGenerationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4000)
    emotion: str = Field(default="평온", max_length=40)


MOOD_PALETTES = {
    "기쁨": ["#1e1b4b", "#b45309", "#f59e0b", "#fef08a"],
    "설렘": ["#1e1b4b", "#9d174d", "#f59e0b", "#fde68a"],
    "피로": ["#0f172a", "#1e293b", "#6366f1", "#cbd5e1"],
    "슬픔": ["#0f172a", "#312e81", "#818cf8", "#e2e8f0"],
    "평온": ["#131829", "#473b54", "#d97706", "#fef3c7"],
}


def build_mood_svg(palette: list[str], title_caption: str) -> str:
    sky_top, sky_bottom, accent, moon = palette
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{sky_top}" />
      <stop offset="100%" stop-color="{sky_bottom}" />
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.24" r="0.35">
      <stop offset="0%" stop-color="{moon}" stop-opacity="0.95" />
      <stop offset="45%" stop-color="{accent}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="{accent}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#sky)" />
  <circle cx="288" cy="96" r="120" fill="url(#glow)" />
  <circle cx="288" cy="96" r="24" fill="{moon}" />
  <path d="M0 290 Q110 245 230 285 T400 275 L400 400 L0 400 Z" fill="#1e2236" />
  <path d="M0 320 Q160 285 310 315 T400 310 L400 400 L0 400 Z" fill="#151826" />
  <rect x="52" y="210" width="84" height="110" rx="6" fill="#10131e" stroke="{accent}" stroke-width="2" />
  <title>{title_caption}</title>
</svg>"""


@app.get("/")
def read_root():
    return {"status": "ok", "service": "Me-Ari Local AI Proxy"}


@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Audio file is empty")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(content)
        file_location = tmp.name

    try:
        segments, _ = model.transcribe(file_location, beam_size=5)
        text = "".join([segment.text for segment in segments])
        return {"text": text.strip()}
    finally:
        if os.path.exists(file_location):
            os.remove(file_location)


@app.post("/api/generate-image")
async def generate_image(payload: ImageGenerationRequest):
    emotion_key = payload.emotion.strip()
    palette = MOOD_PALETTES.get(emotion_key, MOOD_PALETTES["평온"])
    short_caption = payload.text.strip().split(".")[0][:38] or "고요한 밤의 서재와 따뜻한 불빛"
    svg_content = build_mood_svg(palette, short_caption)
    return {
        "svgContent": svg_content,
        "palette": palette,
        "caption": short_caption,
    }
