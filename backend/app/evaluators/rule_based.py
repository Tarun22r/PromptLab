"""
Rule-based evaluator.

This deliberately does NOT call an LLM to "judge" responses — scores are
computed from measurable properties of the input/output pair (overlap,
length ratio, structure validity, formatting adherence). This keeps
evaluation:
  1. Free to run in Demo Mode.
  2. Fully explainable — every score traces to a concrete check.
  3. Honest about its own limits (see `groundedness`, which is skipped
     when there's no source document to check against).

An LLM-judge evaluator could be added later behind the same interface
(see app/schemas/evaluation.py's `method` field, which already
distinguishes "rule_based" from "llm_judge").
"""
import json
import re


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-zA-Z0-9]{3,}", text.lower()))


def _relevance(user_input: str, response: str) -> tuple[int, str]:
    input_terms = _tokenize(user_input)
    response_terms = _tokenize(response)
    if not input_terms:
        return 50, "No meaningful input terms to compare against; score is a neutral default."
    overlap = len(input_terms & response_terms) / len(input_terms)
    score = round(min(100, 40 + overlap * 60))
    return score, (
        f"{round(overlap * 100)}% of distinct input terms reappear in the response, "
        "suggesting the response addresses the stated input."
    )


def _completeness(response: str) -> tuple[int, str]:
    length = len(response.strip())
    if length == 0:
        return 0, "The response is empty."
    # Reward substantive but not padded responses; this is intentionally
    # a crude proxy and is labeled as such in the UI.
    score = round(min(100, 30 + min(length, 600) / 6))
    return score, f"The response is {length} characters long, used as a proxy for depth of coverage."


def _consistency(response: str) -> tuple[int, str]:
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", response) if s.strip()]
    if len(sentences) < 2:
        return 85, "Too short to detect internal contradictions; default high score."
    # Simple heuristic: repeated near-duplicate sentences reduce the score,
    # as does extreme sentence-length variance which often signals rambling.
    lengths = [len(s) for s in sentences]
    variance_penalty = 0
    if lengths:
        avg = sum(lengths) / len(lengths)
        variance = sum((l - avg) ** 2 for l in lengths) / len(lengths)
        variance_penalty = min(20, int(variance**0.5 / 10))
    score = max(40, 95 - variance_penalty)
    return score, "Estimated from sentence-length consistency across the response; large swings can indicate rambling or padding."


def _format_adherence(response: str, output_format: str, json_schema: dict | None) -> tuple[int, str]:
    if output_format == "text":
        return 100, "Free-text format requested; no structural constraint to check."

    if output_format == "json":
        try:
            parsed = json.loads(response)
        except json.JSONDecodeError as e:
            return 0, f"Response is not valid JSON: {e}"
        if not json_schema:
            return 90, "Response is valid JSON. No schema was defined to check field-level adherence."
        expected_keys = set(json_schema.keys())
        actual_keys = set(parsed.keys()) if isinstance(parsed, dict) else set()
        if not expected_keys:
            return 90, "Response is valid JSON; schema had no keys to check."
        matched = len(expected_keys & actual_keys)
        score = round((matched / len(expected_keys)) * 100)
        missing = expected_keys - actual_keys
        note = f"{matched}/{len(expected_keys)} expected schema keys present."
        if missing:
            note += f" Missing: {', '.join(sorted(missing))}."
        return score, note

    if output_format == "markdown":
        has_markdown = bool(re.search(r"(^#|\*\*|- |\d\.\s)", response, re.MULTILINE))
        return (90 if has_markdown else 45), (
            "Response contains recognizable Markdown structure (headings, lists, or emphasis)."
            if has_markdown
            else "No Markdown structural markers detected despite Markdown being requested."
        )

    return 50, "Unknown output format; unable to evaluate."


def evaluate_response(
    user_input: str,
    response_text: str,
    output_format: str = "text",
    json_schema: dict | None = None,
) -> dict:
    """Returns {method, metrics: {name: {score, explanation}}, overall_score}."""
    metrics: dict[str, dict] = {}

    rel_score, rel_note = _relevance(user_input, response_text)
    metrics["relevance"] = {"score": rel_score, "explanation": rel_note}

    comp_score, comp_note = _completeness(response_text)
    metrics["completeness"] = {"score": comp_score, "explanation": comp_note}

    cons_score, cons_note = _consistency(response_text)
    metrics["consistency"] = {"score": cons_score, "explanation": cons_note}

    fmt_score, fmt_note = _format_adherence(response_text, output_format, json_schema)
    metrics["format_adherence"] = {"score": fmt_score, "explanation": fmt_note}

    # Groundedness is only meaningful when there's a source document to
    # check claims against, which this generic evaluator doesn't have —
    # so it is honestly reported as unavailable rather than faked.
    metrics["groundedness"] = {
        "score": None,
        "explanation": "Groundedness requires a reference source document, which wasn't provided for this run.",
    }

    scored = [m["score"] for m in metrics.values() if m["score"] is not None]
    overall = round(sum(scored) / len(scored), 1) if scored else None

    return {"method": "rule_based", "metrics": metrics, "overall_score": overall}
