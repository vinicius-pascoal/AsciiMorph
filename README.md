# AsciiMorph

MVP do **AsciiMorph** para converter imagens e GIFs em arte ASCII.

## Stack

- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: FastAPI + Pillow

## Estrutura

- `frontend/`: aplicação web para upload, controles e preview
- `backend/`: API de conversão para imagem e GIF

## Requisitos

- Node.js 20+
- Python 3.11+

## Rodando o backend

```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API disponível em `http://localhost:8000`.

## Rodando o frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponível em `http://localhost:3000`.

## Endpoints principais

- `POST /api/v1/convert/image`
  - `file`: png, jpg, jpeg, webp
  - `width`: 20..300
  - `charset`: string de caracteres
  - `invert`: true/false

- `POST /api/v1/convert/gif`
  - `file`: gif
  - `width`: 20..300
  - `charset`: string de caracteres
  - `invert`: true/false

## Status MVP

- Versão 1: concluída (imagem estática)
- Versão 2: base implementada (GIF frame a frame com reprodução no navegador)
