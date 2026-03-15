"""
risk_analyzer.py — Analyzes EXIF metadata for security risks.
"""

import re

# Patterns that indicate HIGH risk (potential injection / XSS / SQL)
HIGH_RISK_PATTERNS = [
    r"<script[\s>]",
    r"</script>",
    r"onerror\s*=",
    r"onload\s*=",
    r"onclick\s*=",
    r"javascript\s*:",
    r"alert\s*\(",
    r"eval\s*\(",
    r"document\.cookie",
    r"document\.write",
    r"window\.location",
    r"'[\s]*OR[\s]*'",
    r"\"[\s]*OR[\s]*\"",
    r"DROP[\s]+TABLE",
    r"SELECT[\s]+\*[\s]+FROM",
    r"INSERT[\s]+INTO",
    r"DELETE[\s]+FROM",
    r"UNION[\s]+SELECT",
    r"--[\s]*$",
    r";\s*DROP",
    r"xp_cmdshell",
    r"exec\s*\(",
    r"system\s*\(",
    r"passthru\s*\(",
    r"base64_decode\s*\(",
    r"<iframe",
    r"<object",
    r"<embed",
    r"vbscript\s*:",
    r"data:text/html",
]

# Patterns that indicate MEDIUM risk (comments / user data present)
MEDIUM_RISK_PATTERNS = [
    r"http[s]?://",
    r"ftp://",
    r"www\.",
    r"@[\w.-]+\.\w+",
    r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b",  # IP address
]

# Fields checked for risk
RISK_FIELDS = [
    "UserComment",
    "ImageDescription",
    "XPComment",
    "MakerNote",
    "Software",
    "Artist",
    "Copyright",
    "Make",
    "Model",
]


def analyze_risk(metadata: dict) -> dict:
    """
    Analyze metadata for risk indicators.
    Returns a dict with:
      - level: "LOW" | "MEDIUM" | "HIGH"
      - findings: list of dicts {field, value, pattern, level}
      - summary: human-readable summary
    """
    findings = []

    for field in RISK_FIELDS:
        value = metadata.get(field)
        if not value or not isinstance(value, str):
            continue

        value_upper = value.upper()

        # Check HIGH risk patterns
        for pattern in HIGH_RISK_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                findings.append({
                    "field": field,
                    "value": value[:200],
                    "matched_pattern": pattern,
                    "level": "HIGH",
                })
                break  # one finding per field is enough

        else:
            # Check MEDIUM risk patterns only if no HIGH match
            for pattern in MEDIUM_RISK_PATTERNS:
                if re.search(pattern, value, re.IGNORECASE):
                    findings.append({
                        "field": field,
                        "value": value[:200],
                        "matched_pattern": pattern,
                        "level": "MEDIUM",
                    })
                    break

    # Determine overall level
    levels = [f["level"] for f in findings]
    if "HIGH" in levels:
        overall = "HIGH"
        summary = (
            f"⚠️ HIGH RISK: {len([f for f in findings if f['level'] == 'HIGH'])} "
            "malicious payload pattern(s) detected in image metadata. "
            "This image may have been crafted to exploit metadata injection vulnerabilities."
        )
    elif "MEDIUM" in levels:
        overall = "MEDIUM"
        summary = (
            f"🔶 MEDIUM RISK: {len(findings)} metadata field(s) contain user-generated content "
            "such as URLs, email addresses, or IP addresses. Review before trusting."
        )
    elif metadata:
        overall = "LOW"
        summary = "✅ LOW RISK: No suspicious patterns detected. Metadata appears clean."
    else:
        overall = "LOW"
        summary = "✅ LOW RISK: No metadata found in this image."

    return {
        "level": overall,
        "findings": findings,
        "summary": summary,
    }
