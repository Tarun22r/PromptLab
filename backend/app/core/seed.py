from sqlalchemy.orm import Session

from app.models.template import PromptTemplate

TEMPLATES = [
    dict(
        name="Customer Complaint Classification",
        description="Classifies a customer complaint into category and severity, with a recommended action.",
        task_type="classification",
        technique="structured-output",
        system_instructions=(
            "You are a customer support triage assistant. Classify the complaint into a category "
            "and severity, and recommend a next action. Respond only with valid JSON matching the schema."
        ),
        user_input_template="Customer message: {{customer_message}}",
        output_format="json",
        json_schema={
            "complaint": "string",
            "category": "string",
            "severity": "string",
            "recommended_action": "string",
        },
        tags=["customer-support", "classification", "json"],
    ),
    dict(
        name="Resume Information Extraction",
        description="Extracts structured candidate data from raw resume text.",
        task_type="extraction",
        technique="structured-output",
        system_instructions=(
            "Extract structured candidate information from the resume text below. "
            "Respond only with valid JSON matching the schema. If a field is missing, use null."
        ),
        user_input_template="Resume text:\n{{resume_text}}",
        output_format="json",
        json_schema={
            "name": "string",
            "years_experience": "number",
            "skills": "array",
            "most_recent_title": "string",
        },
        tags=["hr", "extraction", "json"],
    ),
    dict(
        name="Meeting Summary",
        description="Summarizes a meeting transcript into decisions and action items.",
        task_type="summarization",
        technique="role-prompting",
        system_instructions=(
            "You are an executive assistant. Summarize the meeting transcript into: key discussion "
            "points, decisions made, and action items with owners. Use Markdown."
        ),
        user_input_template="Transcript:\n{{transcript}}",
        output_format="markdown",
        json_schema=None,
        tags=["productivity", "summarization"],
    ),
    dict(
        name="Product Review Analysis",
        description="Analyzes sentiment and key themes in a product review.",
        task_type="sentiment-analysis",
        technique="zero-shot",
        system_instructions="Analyze the sentiment and key themes of the product review below.",
        user_input_template="Review: {{review_text}}",
        output_format="json",
        json_schema={"sentiment": "string", "themes": "array", "star_estimate": "number"},
        tags=["e-commerce", "sentiment-analysis"],
    ),
    dict(
        name="SQL Query Generation",
        description="Generates a SQL query from a natural-language request against a known schema.",
        task_type="code-generation",
        technique="few-shot",
        system_instructions=(
            "You translate natural-language requests into SQL queries for the given schema. "
            "Only output the SQL query, no explanation."
        ),
        user_input_template="Schema:\n{{schema}}\n\nRequest: {{request}}",
        output_format="text",
        json_schema=None,
        tags=["sql", "code-generation"],
    ),
    dict(
        name="Text Classification",
        description="Classifies free text into one of a fixed set of provided labels.",
        task_type="classification",
        technique="few-shot",
        system_instructions="Classify the input text into exactly one of the provided labels: {{labels}}.",
        user_input_template="Text: {{text}}",
        output_format="text",
        json_schema=None,
        tags=["classification"],
    ),
    dict(
        name="Sentiment Analysis",
        description="Simple positive/neutral/negative sentiment classification.",
        task_type="sentiment-analysis",
        technique="zero-shot",
        system_instructions="Classify the sentiment of the text as positive, neutral, or negative. Respond with one word.",
        user_input_template="Text: {{text}}",
        output_format="text",
        json_schema=None,
        tags=["sentiment-analysis"],
    ),
    dict(
        name="Data Extraction",
        description="General-purpose field extraction from unstructured text, given a target schema.",
        task_type="extraction",
        technique="structured-output",
        system_instructions="Extract the requested fields from the text. Respond only with valid JSON.",
        user_input_template="Fields to extract: {{fields}}\n\nText:\n{{text}}",
        output_format="json",
        json_schema={"extracted": "object"},
        tags=["extraction", "json"],
    ),
]


def seed_templates(db: Session) -> None:
    if db.query(PromptTemplate).count() > 0:
        return
    for t in TEMPLATES:
        db.add(PromptTemplate(**t))
    db.commit()
