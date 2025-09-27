FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY ../../week5/backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY ../../week5/backend /app

ENV FLASK_APP=app.py
ENV PYTHONUNBUFFERED=1
EXPOSE 5000

# simple health endpoint recommended in your Flask app: /healthz
HEALTHCHECK --interval=30s --timeout=3s CMD curl -fsS http://localhost:5000/healthz || exit 1

CMD ["gunicorn", "-b", "0.0.0.0:5000", "--workers", "3", "app:app"]
