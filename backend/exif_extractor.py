"""
exif_extractor.py — Extract EXIF metadata from JPG/PNG images.
Handles IFDRational, bytes, tuples, and all non-JSON-serializable types.
"""

import io
import fractions
from PIL import Image, ExifTags
import piexif


# ── Serialization helpers ─────────────────────────────────────────────────────

def _safe_value(value):
    """
    Recursively convert any EXIF value to a JSON-serializable Python primitive.
    Handles: IFDRational, fractions.Fraction, bytes, tuple, list, int, float, str.
    """
    type_name = type(value).__name__

    # IFDRational (Pillow internal) — convert via float
    if type_name == "IFDRational":
        try:
            if value.denominator == 0:
                return 0
            return float(value)
        except Exception:
            return str(value)

    # Standard fraction
    if isinstance(value, fractions.Fraction):
        try:
            return float(value)
        except Exception:
            return str(value)

    # Bytes — try UTF-8 / UTF-16 decode, otherwise hex
    if isinstance(value, bytes):
        # Strip common UserComment charset headers
        for prefix in (b"ASCII\x00\x00\x00", b"UNICODE\x00", b"JIS\x00\x00\x00\x00\x00"):
            if value.startswith(prefix):
                value = value[len(prefix):]
                break
        # Try UTF-16-LE (Windows XP fields)
        try:
            decoded = value.decode("utf-16-le", errors="strict").rstrip("\x00")
            if decoded.isprintable() or " " in decoded:
                return decoded
        except Exception:
            pass
        # Try UTF-8
        try:
            decoded = value.decode("utf-8", errors="strict").rstrip("\x00")
            if decoded:
                return decoded
        except Exception:
            pass
        # Fallback: latin-1 (never fails)
        decoded = value.decode("latin-1", errors="replace").rstrip("\x00")
        if decoded and decoded.isprintable():
            return decoded
        return value.hex()

    # Tuple / list — recurse
    if isinstance(value, (tuple, list)):
        # Single rational stored as (numerator, denominator)
        if (len(value) == 2
                and isinstance(value[0], int)
                and isinstance(value[1], int)
                and value[1] != 0):
            return round(value[0] / value[1], 8)
        converted = [_safe_value(v) for v in value]
        return converted[0] if len(converted) == 1 else converted

    # int / float / str / bool / None → pass through
    if isinstance(value, (int, float, str, bool, type(None))):
        return value

    # Unknown type — stringify
    return str(value)


# ── GPS helpers ───────────────────────────────────────────────────────────────

def _rationals_to_degrees(rationals):
    """Convert a (D, M, S) list of rationals to decimal degrees."""
    try:
        def to_float(r):
            if isinstance(r, (tuple, list)):
                return r[0] / r[1] if r[1] else 0
            return float(r)
        d = to_float(rationals[0])
        m = to_float(rationals[1])
        s = to_float(rationals[2])
        return d + (m / 60.0) + (s / 3600.0)
    except Exception:
        return None


# ── Main extractor ────────────────────────────────────────────────────────────

def extract_metadata(image_bytes: bytes) -> dict:
    """
    Extract all available metadata from image bytes.
    Returns a flat dict mapping human-readable field name → JSON-safe value.
    """
    metadata = {}

    # Open image
    try:
        img = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        return {"error": str(e)}

    # Basic image properties
    metadata["Format"]  = img.format  or "Unknown"
    metadata["Mode"]    = img.mode    or "Unknown"
    metadata["Width"]   = img.width
    metadata["Height"]  = img.height

    # ── Pillow tag-based EXIF ─────────────────────────────────────────────────
    try:
        raw_exif = img._getexif()
        if raw_exif:
            for tag_id, value in raw_exif.items():
                tag_name = ExifTags.TAGS.get(tag_id, f"Tag_{tag_id}")
                safe = _safe_value(value)
                # Truncate huge MakerNote blobs
                if tag_name == "MakerNote" and isinstance(safe, str) and len(safe) > 300:
                    safe = safe[:300] + "…"
                metadata[tag_name] = safe
    except Exception:
        pass

    # ── piexif deep parse ─────────────────────────────────────────────────────
    try:
        exif_dict = piexif.load(image_bytes)

        ifd_attr_map = {
            "0th":  piexif.ImageIFD,
            "Exif": piexif.ExifIFD,
            "GPS":  piexif.GPSIFD,
            "1st":  piexif.ImageIFD,
        }

        for ifd_name, tag_dict in exif_dict.items():
            if ifd_name == "thumbnail" or not isinstance(tag_dict, dict):
                continue
            attr_class = ifd_attr_map.get(ifd_name)
            for tag_id, value in tag_dict.items():
                # Resolve human-readable tag name
                tag_name = None
                if attr_class:
                    for attr in dir(attr_class):
                        if getattr(attr_class, attr) == tag_id:
                            tag_name = attr
                            break
                if not tag_name:
                    tag_name = f"{ifd_name}_{tag_id}"
                # Don't overwrite a value already extracted by Pillow
                if tag_name not in metadata:
                    metadata[tag_name] = _safe_value(value)

        # ── GPS → decimal degrees ─────────────────────────────────────────────
        gps = exif_dict.get("GPS", {})
        if gps:
            lat_raw = gps.get(piexif.GPSIFD.GPSLatitude)
            lat_ref = gps.get(piexif.GPSIFD.GPSLatitudeRef)
            lon_raw = gps.get(piexif.GPSIFD.GPSLongitude)
            lon_ref = gps.get(piexif.GPSIFD.GPSLongitudeRef)

            if lat_raw and lon_raw:
                lat = _rationals_to_degrees(lat_raw)
                lon = _rationals_to_degrees(lon_raw)
                if lat is not None and lon is not None:
                    ref_lat = _safe_value(lat_ref) if lat_ref else "N"
                    ref_lon = _safe_value(lon_ref) if lon_ref else "E"
                    if str(ref_lat).upper() in ("S",):
                        lat = -lat
                    if str(ref_lon).upper() in ("W",):
                        lon = -lon
                    metadata["GPS Latitude"]  = round(lat, 7)
                    metadata["GPS Longitude"] = round(lon, 7)

    except Exception:
        pass

    # ── PNG text chunks ───────────────────────────────────────────────────────
    if img.format == "PNG":
        try:
            for key, value in img.info.items():
                if key not in metadata:
                    metadata[key] = _safe_value(value)
        except Exception:
            pass

    # ── Final safety pass — ensure every value is JSON-serializable ──────────
    clean = {}
    for k, v in metadata.items():
        try:
            import json
            json.dumps(v)          # test serialisability
            clean[k] = v
        except (TypeError, ValueError):
            clean[k] = str(v)      # last-resort stringify

    return clean
