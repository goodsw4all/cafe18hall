from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Static files (CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    player_names = ["이름입력" for i in range(1, 7)]
    players = []
    for name in player_names:
        players.append({
            "name": name,
            "scores": [{"plus": 0, "minus": 0} for _ in range(17)],
            "total": 0
        })
    return templates.TemplateResponse("index.html", {"request": request, "players": players})