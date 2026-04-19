# 🔍 EXIF Forensics Tool

A full-stack web application for forensic analysis of image EXIF metadata, built with **React.js** (frontend) and **Flask/Python** (backend).

---

## ✨ Features

| Feature | Description |
|---|---|
| 📤 Image Upload | Drag-and-drop or select JPG / PNG (max 10 MB) |
| 📋 EXIF Extraction | 20+ metadata fields including GPS, camera info, comments |
| 🗺️ GPS Map | OpenStreetMap embed + Google Maps deep-link |
| 🛡️ Risk Matrix | LOW / MEDIUM / HIGH risk scoring with pattern matching |
| ✏️ Metadata Injection | Add Author, Comment, Description fields |
| 🗑️ Metadata Strip | Remove all metadata and download clean image |
| 🔒 Security | File type validation, size limits, MIME checking |

---

## 📁 Project Structure

```
exif-forensics/
├── backend/
│   ├── app.py                    # Flask API (4 endpoints: /upload, /inject, /strip, /health)
│   ├── exif_extractor.py         # EXIF parsing via Pillow + piexif
│   ├── risk_analyzer.py          # Pattern-based risk scoring
│   └── requirements.txt          # Python dependencies
└── frontend/
    ├── public/
    │   └── index.html            # Single HTML entry point
    ├── src/
    │   ├── App.jsx               # Main app with page routing
    │   ├── api.js                # Flask base URL configuration
    │   ├── index.js              # React entry point
    │   ├── index.css             # Global styles and CSS variables
    │   ├── components/
    │   │   ├── BackendStatus.jsx  # Flask connection status indicator
    │   │   ├── GoogleMapViewer.jsx# GPS location map (OpenStreetMap)
    │   │   ├── MetadataEditor.jsx # Inject / strip metadata form
    │   │   ├── MetadataViewer.jsx # Searchable metadata table
    │   │   ├── PageHeader.jsx     # Top header shown on every page
    │   │   ├── RiskMatrix.jsx     # Risk badge, meter and findings
    │   │   ├── Sidebar.jsx        # Left navigation menu
    │   │   └── UploadImage.jsx    # Drag and drop image uploader
    │   └── pages/
    │       ├── AboutPage.jsx      # About the tool and EXIF information
    │       ├── Dashboard.jsx      # Main page — upload, metadata, GPS map
    │       ├── MetadataEditorPage.jsx # Full page for inject/strip actions
    │       └── RiskPage.jsx       # Full risk analysis results page
    └── package.json              # Node dependencies and scripts
```

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+ and npm

---

### 1. Backend Setup

```bash
cd exif-forensics/backend

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Start Flask dev server
python app.py
# → Running on http://localhost:5000
```

---

### 2. Frontend Setup

```bash
cd exif-forensics/frontend

# Install npm packages
npm install

# Start React dev server
npm start
# → Running on http://localhost:3000
```

The React app proxies API calls to `localhost:5000` via the `"proxy"` field in `package.json`.

---

## 🌐 API Endpoints

### `POST /upload`
Upload an image for metadata extraction and risk analysis.

**Body:** `multipart/form-data` with field `image`

**Response:**
```json
{
  "metadata": { "Make": "Apple", "GPS Latitude": 37.331, ... },
  "risk": {
    "level": "HIGH",
    "summary": "⚠️ HIGH RISK: 1 malicious payload pattern(s) detected...",
    "findings": [{ "field": "UserComment", "value": "...", "level": "HIGH", "matched_pattern": "..." }]
  },
  "preview": "data:image/jpeg;base64,...",
  "filename": "photo.jpg"
}
```

---

### `POST /inject`
Inject custom metadata fields into an image.

**Body:** `multipart/form-data` with fields:
- `image` — the image file
- `author` — (optional) Author string
- `comment` — (optional) UserComment string
- `description` — (optional) ImageDescription string

**Response:**
```json
{
  "success": true,
  "data": "data:image/jpeg;base64,...",
  "filename": "photo_injected.jpg"
}
```

---

### `POST /strip`
Strip all EXIF metadata from an image.

**Body:** `multipart/form-data` with field `image`

**Response:**
```json
{
  "success": true,
  "data": "data:image/jpeg;base64,...",
  "filename": "photo_stripped.jpg"
}
```

---

## 🛡️ Risk Scoring Logic

| Level | Criteria |
|---|---|
| **LOW** | No comment fields, or clean metadata |
| **MEDIUM** | URLs, email addresses, or IP addresses in metadata |
| **HIGH** | XSS payloads (`<script>`, `onerror=`, `javascript:`), SQL injection (`DROP TABLE`, `UNION SELECT`), eval / exec patterns |

Fields scanned: `UserComment`, `ImageDescription`, `XPComment`, `MakerNote`, `Software`, `Artist`, `Copyright`, `Make`, `Model`

---

## 🔒 Security Considerations

- Maximum file size: **10 MB**
- Allowed extensions: `.jpg`, `.jpeg`, `.png`
- MIME type validation on upload
- Actual image format verified using `PIL.Image.verify()`
- No files are stored on disk — everything is processed in-memory
- CORS enabled (restrict origins in production)

---

## 🏭 Production Notes

For production deployment:

1. Set `debug=False` in `app.py`
2. Run Flask behind **gunicorn**: `gunicorn -w 4 app:app`
3. Restrict CORS origins: `CORS(app, origins=["https://yourdomain.com"])`
4. Build the React app: `npm run build` and serve via nginx
5. Add rate limiting (e.g., `flask-limiter`)
6. Consider adding authentication for sensitive deployments

---

## 📦 requirements.txt

```
Flask==3.0.0
Flask-CORS==4.0.0
Pillow==10.1.0
piexif==1.1.3
Werkzeug==3.0.1
```
