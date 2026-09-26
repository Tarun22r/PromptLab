"""
Deterministic mock response generation for Demo Mode.

These are NOT real model outputs. They are rule-based text built from the
user's own input so the response is at least contextually relevant, and
every response is labeled as a demo response by the caller. This exists so
the full product (comparison, evaluation, library, experiment history) can
be explored by anyone without an API key — a common expectation for a
portfolio project a reviewer will actually run.
"""
import hashlib
import json
import re


def _seed(text: str) -> int:
    return int(hashlib.sha256(text.encode()).hexdigest(), 16)


def _extract_keywords(text: str, limit: int = 5) -> list[str]:
    words = re.findall(r"[a-zA-Z]{4,}", text.lower())
    stop = {"this", "that", "with", "from", "have", "will", "your", "please", "about"}
    seen = []
    for w in words:
        if w not in stop and w not in seen:
            seen.append(w)
        if len(seen) >= limit:
            break
    return seen or ["input"]


def generate_demo_response(
    system_instructions: str, user_input: str, output_format: str, temperature: float
) -> str:
    seed = _seed(system_instructions + user_input) % 1000
    keywords = _extract_keywords(user_input)

    if output_format == "json":
        return json.dumps(
            {
                "summary": f"Demo analysis of the provided input, focused on: {', '.join(keywords)}.",
                "key_points": [f"Point related to '{k}'" for k in keywords[:3]] or ["No clear key points found"],
                "confidence": round(0.55 + (seed % 40) / 100, 2),
                "note": "This is a deterministic Demo Mode response, not a real model output.",
            },
            indent=2,
        )

    if output_format == "markdown":
        bullets = "\n".join(f"- Observation about **{k}**" for k in keywords[:4])
        return (
            f"### Demo Response\n\n"
            f"Based on the input you provided, here is a structured mock analysis "
            f"(temperature={temperature}):\n\n{bullets}\n\n"
            f"> Generated deterministically in Demo Mode — not a live model response."
        )

    sentence_bank = [
        f"The input appears to center on {', '.join(keywords[:3])}.",
        "In a real run, the configured model would generate a response conditioned on the system instructions above.",
        f"Demo seed {seed} was used to keep this output deterministic for repeatable testing.",
        "This text is intentionally simple so that evaluation and comparison features remain easy to reason about.",
    ]
    return " ".join(sentence_bank)
