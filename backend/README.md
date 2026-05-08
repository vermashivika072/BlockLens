# Smart Certificate Verification Platform

A production-style FastAPI backend for certificate upload, verification, AI-assisted fraud detection, QR validation, and simulated blockchain/ZKP workflows.

## Features

- JWT-based authentication with register/login flows
- Certificate upload for image or PDF files
- MongoDB collections for Users, Certificates, AnalysisResults, and BlockchainRecords
- OCR extraction with `pytesseract`
- NLP anomaly analysis with `spaCy`
- Error Level Analysis heatmap generation with OpenCV/Pillow
- AI auditor that combines OCR, NLP, ELA, issuer OSINT, blockchain integrity, and QR phishing checks
- Simulated SHA-256 blockchain record validation
- QR code generation pointing to `/verify/{certificate_id}`
- Simulated phishing QR protector with blacklist/whitelist checks
- Simulated OSINT issuer validation
- Simulated zero-knowledge proof response
- Seeder script with 10 real and 10 fake certificate records
- Logging, rate limiting, and centralized error handling

## Project Structure

```text
app/
  api/
  core/
  db/
  schemas/
  services/
scripts/
sample_outputs/
storage/
```

## Setup

1. Create a virtual environment and install dependencies:

```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and update values as needed.

3. Start MongoDB locally.

If you use Docker, run:

```bash
docker compose up -d mongodb
```

The app is already configured to use:

```text
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=certichain_ai
```

4. Ensure Tesseract OCR is installed and available in your system PATH.

5. Start the API:

```bash
uvicorn app.main:app --reload
```

## Seeder

Seed 20 realistic sample certificates:

```bash
python scripts/seed_data.py
```

## Database Connection Check

After starting the API, verify MongoDB connectivity with:

```bash
curl http://localhost:8000/health/database
```

Expected response:

```json
{
  "status": "ok",
  "database": "certichain_ai",
  "mongodb_uri": "mongodb://localhost:27017"
}
```

## Main Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /upload-certificate`
- `GET /verify/{id}`
- `GET /certificates`
- `POST /analyze`
- `GET /qr-scan/{id}`
- `GET /heatmap/{id}`

## Example Upload Request

```bash
curl -X POST "http://localhost:8000/upload-certificate" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@sample_certificate.png" \
  -F "name=Aarav Mehta" \
  -F "issuer=Stanford University" \
  -F "issue_date=2026-03-12" \
  -F "expiry_date=2029-03-12" \
  -F "dataset_tag=real"
```

## Security Notes

- Keep `JWT_SECRET_KEY` secret in production.
- Restrict CORS origins for deployed environments.
- Replace the simulated issuer registry, phishing lists, and ZKP workflow with real services for production use.

## Sample Responses

See `sample_outputs/api_responses.json` for example payloads.
