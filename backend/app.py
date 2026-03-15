"""
app.py — Flask backend for EXIF Forensics Tool.
"""

import io
import os
import base64

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from PIL import Image
import piexif

from exif_extractor import extract_metadata
from risk_analyzer import analyze_risk

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def _validate_upload(file):
    if not file or file.filename == "":
        return False, "No file selected."
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Invalid file type '{ext}'. Only JPG and PNG are allowed."
    return True, None


def _read_limited(file):
    data = file.read(MAX_FILE_SIZE + 1)
    if len(data) > MAX_FILE_SIZE:
        return None, f"File exceeds maximum size of {MAX_FILE_SIZE // (1024*1024)} MB."
    return data, None


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "EXIF Forensics backend running"})


@app.route("/upload", methods=["POST", "OPTIONS"])
def upload():
    if request.method == "OPTIONS":
        return make_response("", 204)

    file = request.files.get("image")
    ok, err = _validate_upload(file)
    if not ok:
        return jsonify({"error": err}), 400

    data, err = _read_limited(file)
    if err:
        return jsonify({"error": err}), 400

    try:
        img = Image.open(io.BytesIO(data))
        img.verify()
    except Exception:
        return jsonify({"error": "File does not appear to be a valid image."}), 400

    metadata = extract_metadata(data)
    risk = analyze_risk(metadata)

    preview_data_url = None
    try:
        img = Image.open(io.BytesIO(data))
        img.thumbnail((600, 600))
        buf = io.BytesIO()
        fmt = img.format or "JPEG"
        if fmt == "PNG":
            img.save(buf, format="PNG")
            mime = "image/png"
        else:
            img = img.convert("RGB")
            img.save(buf, format="JPEG", quality=80)
            mime = "image/jpeg"
        preview_data_url = f"data:{mime};base64,{base64.b64encode(buf.getvalue()).decode()}"
    except Exception as e:
        print(f"Preview error: {e}")

    return jsonify({
        "metadata": metadata,
        "risk": risk,
        "preview": preview_data_url,
        "filename": file.filename,
    })


@app.route("/inject", methods=["POST", "OPTIONS"])
def inject():
    if request.method == "OPTIONS":
        return make_response("", 204)

    file = request.files.get("image")
    ok, err = _validate_upload(file)
    if not ok:
        return jsonify({"error": err}), 400

    data, err = _read_limited(file)
    if err:
        return jsonify({"error": err}), 400

    author = request.form.get("author", "")
    comment = request.form.get("comment", "")
    description = request.form.get("description", "")

    try:
        img = Image.open(io.BytesIO(data))
        fmt = img.format or "JPEG"

        if fmt == "PNG":
            from PIL import PngImagePlugin
            meta = PngImagePlugin.PngInfo()
            if author: meta.add_text("Author", author)
            if comment: meta.add_text("Comment", comment)
            if description: meta.add_text("Description", description)
            buf = io.BytesIO()
            img.save(buf, format="PNG", pnginfo=meta)
            mime = "image/png"
            ext = ".png"
        else:
            img = img.convert("RGB")
            try:
                exif_dict = piexif.load(data)
            except Exception:
                exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}}
            if author:
                exif_dict["0th"][piexif.ImageIFD.Artist] = author.encode("utf-8")
            if description:
                exif_dict["0th"][piexif.ImageIFD.ImageDescription] = description.encode("utf-8")
            if comment:
                exif_dict["Exif"][piexif.ExifIFD.UserComment] = b"ASCII\x00\x00\x00" + comment.encode("utf-8")
            exif_bytes = piexif.dump(exif_dict)
            buf = io.BytesIO()
            img.save(buf, format="JPEG", exif=exif_bytes, quality=92)
            mime = "image/jpeg"
            ext = ".jpg"

        modified_b64 = base64.b64encode(buf.getvalue()).decode()
        filename = os.path.splitext(file.filename)[0] + "_injected" + ext
        return jsonify({"success": True, "data": f"data:{mime};base64,{modified_b64}", "filename": filename})

    except Exception as e:
        return jsonify({"error": f"Injection failed: {str(e)}"}), 500


@app.route("/strip", methods=["POST", "OPTIONS"])
def strip():
    if request.method == "OPTIONS":
        return make_response("", 204)

    file = request.files.get("image")
    ok, err = _validate_upload(file)
    if not ok:
        return jsonify({"error": err}), 400

    data, err = _read_limited(file)
    if err:
        return jsonify({"error": err}), 400

    try:
        img = Image.open(io.BytesIO(data))
        fmt = img.format or "JPEG"
        buf = io.BytesIO()

        if fmt == "PNG":
            clean = Image.new(img.mode, img.size)
            clean.putdata(list(img.getdata()))
            clean.save(buf, format="PNG")
            mime = "image/png"
            ext = ".png"
        else:
            img = img.convert("RGB")
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=92)
            mime = "image/jpeg"
            ext = ".jpg"

        stripped_b64 = base64.b64encode(buf.getvalue()).decode()
        filename = os.path.splitext(file.filename)[0] + "_stripped" + ext
        return jsonify({"success": True, "data": f"data:{mime};base64,{stripped_b64}", "filename": filename})

    except Exception as e:
        return jsonify({"error": f"Strip failed: {str(e)}"}), 500


if __name__ == "__main__":
    print("=" * 50)
    print("  EXIF Forensics Backend starting...")
    print("  URL:    http://localhost:5000")
    print("  Health: http://localhost:5000/health")
    print("=" * 50)
    app.run(debug=True, port=5000, host="0.0.0.0")
