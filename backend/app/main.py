from fastapi import FastAPI

app = FastAPI(title="BeaverLink API")


@app.get("/health")
def health():
    return {"status": "ok"}
