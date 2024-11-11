# Use the official Python image as the base image
FROM python:3-alpine

COPY src/server.py /src/server.py
WORKDIR /src

COPY requirements.txt .

RUN \
 apk add --no-cache postgresql-libs && \
 apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev && \
 python3 -m pip install -r requirements.txt --no-cache-dir && \
 apk --purge del .build-deps

CMD ["python3", "/src/server.py"]
