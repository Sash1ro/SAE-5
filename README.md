# Manganitor

[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-v57-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![ONNX Runtime](https://img.shields.io/badge/ONNX_Runtime-Edge_AI-005CED?logo=onnx&logoColor=white)](https://onnxruntime.ai/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**Manganitor** is an AI-powered mobile application designed for instant manga volume identification and collection tracking. It runs **Edge AI inference** directly on the device using ONNX models for real-time, offline detection, backed by a **FastAPI** server that manages history, community contributions, and dynamic vector index updates.

Developed as part of the **SAE 5.01** project (IUT Informatique).

## Features

- **Offline Edge AI Scanner**: Recognizes manga covers directly on-device using quantized ONNX models without requiring an internet connection.
- **Two-Stage Identification**: Uses YOLO11m for cover localization and a quantized DinoV2 Vision Transformer for visual embeddings and cosine similarity search.
- **MangaDex Metadata**: Automatically retrieves volume titles, synopsis, author details, and official cover art.
- **Annotated History**: History uploads are processed by an OpenCV pipeline that draws bounding boxes and similarity scores directly onto the stored image.
- **Continuous Learning & Index Sync**: Community submissions are augmented and embedded nightly via a scheduled backend cron runner. Mobile clients sync the updated vector index over-the-air.
- **Cross-Platform**: Built for Android, iOS, and Web with React Native and Expo Router.

## How It Works

1. **Cover Detection**: YOLO11m (`yolo.onnx`) detects and crops the manga cover bounding box from the camera frame.
2. **Feature Extraction**: DinoV2 INT8 (`dinov2_int8.onnx`) generates a 384-dimensional visual embedding vector from the cropped cover.
3. **Local Vector Search**: The vector is compared against `index_mangas.json` using cosine similarity (matching requires similarity >= 0.70 and margin >= 0.05).
4. **Metadata Lookup**: Once identified, official manga information is fetched from the MangaDex API.
5. **Nightly Retraining**: Contributed covers are augmented and re-indexed every night at 03:00 by the backend cron worker (`cron_runner.py`), making new volumes immediately searchable for all clients after an index sync.

## Tech Stack

- **Mobile Client (`src/`)**: React Native 0.86, Expo 57, Expo Router, ONNX Runtime (`onnxruntime-react-native` / `onnxruntime-web`), Zustand.
- **Backend API (`server/`)**: FastAPI, Python 3.11, Uvicorn, SQLModel / SQLAlchemy, PostgreSQL 16.
- **Computer Vision & AI**: PyTorch, Torchvision, OpenCV (`opencv-python-headless`), Pillow, NumPy.
- **DevOps**: Docker Compose, GitHub Actions (automated Android APK releases).

## Quick Start

### 1. Backend (Docker Compose)

Navigate to `server/` and start the stack (PostgreSQL, FastAPI API, and the scheduled cron worker):

```bash
cd server
cp .env.example .env # or configure DB_USER, DB_PASSWORD, JWT_SECRET
docker compose up -d --build
```

- API is available at: `http://localhost:8001`
- Database data is persisted in the `pg_data` Docker volume.

### 2. Mobile App (Expo)

Navigate to `src/` and install dependencies:

```bash
cd src
npm install
```

Configure your backend URL in `src/src/services/apiService.ts`:
```typescript
export const API_URL = "http://localhost:8001"; // Use your local LAN IP when testing on a physical device
```

Start the application:

```bash
# Start Expo development server
npx expo start

# Run on Android
npm run android

# Run on Web
npm run web
```

## API Overview

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/users/register` | Register new user account | No |
| `POST` | `/api/users/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/users/me` | Current user profile | Yes |
| `GET` | `/api/history` | List scan history entries | Yes |
| `POST` | `/api/history` | Save scan with OpenCV annotated box | Yes |
| `DELETE`| `/api/history/{id}` | Delete a scan history entry | Yes |
| `POST` | `/api/contributions` | Submit new manga cover for retraining | Yes |
| `GET` | `/api/index/version` | Get current vector index version | No |
| `GET` | `/api/index/download`| Download updated `index_mangas.json` | No |
| `GET` | `/api/mangadex/manga/{title}` | Fetch MangaDex volume metadata | No |

## Build & CI/CD

Android APK releases are built automatically via GitHub Actions (`.github/workflows/build.yaml`):

- **Pushing a tag**: Any tag matching `v*` (e.g. `git tag v1.0.0 && git push origin v1.0.0`) triggers a build and publishes the release on GitHub.
- **Manual trigger**: Run via the **Actions** tab in GitHub by selecting **Build & Release APK**.
The workflow uses JDK 17, applies compatibility fixes for Gradle 9 and ONNX Runtime, and exports a standalone APK.

## Authors & Academic Context

Developed for the **SAE 5.01** project at **IUT Informatique**.
Manga metadata provided by [MangaDex](https://mangadex.org).
