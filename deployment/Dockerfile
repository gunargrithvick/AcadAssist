FROM rasa/rasa:3.1.0
COPY . /app
WORKDIR /app
RUN pip install -r backend/requirements.txt
CMD ["run", "--enable-api", "--cors", "*", "--debug"]