FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN apt-get update && apt-get install -y libgl1-mesa-dev

EXPOSE 7000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7000"]