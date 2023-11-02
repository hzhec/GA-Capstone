FROM python:3.11.6

WORKDIR /app

RUN apt-get update \
    && apt-get install -y gcc python3-dev libpq-dev ffmpeg libsm6 libxext6

COPY . /app

RUN python3 -m pip install --upgrade pip \
    && pip install -r requirements.txt

EXPOSE 65432

ENV NAME venv

CMD ["python3", "app.py"]