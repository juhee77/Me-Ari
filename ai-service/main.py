from fastapi import FastAPI, UploadFile, File
from faster_whisper import WhisperModel
import os

app = FastAPI()

# Initialize whisper model globally
model_size = "tiny"
# Run on CPU with INT8 by default if on Mac, or auto
model = WhisperModel(model_size, device="cpu", compute_type="int8")

@app.get("/")
def read_root():
    return {"status": "ok", "service": "Me-Ari Local AI Proxy"}

@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    # Save the uploaded file temporarily
    file_location = f"/tmp/{file.filename}"
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())

    try:
        segments, info = model.transcribe(file_location, beam_size=5)
        text = "".join([segment.text for segment in segments])
        return {"text": text.strip()}
    finally:
        if os.path.exists(file_location):
            os.remove(file_location)
