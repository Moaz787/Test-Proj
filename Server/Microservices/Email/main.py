from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import smtplib
from email.message import EmailMessage

app = FastAPI()

EMAIL_ADDRESS = "moaazseadawy@gmail.com"
EMAIL_PASSWORD = "kort vuyg vpyq hqvy"


class EmailRequest(BaseModel):
    receiver: str
    subject: str
    body: str


@app.get("/")
def root():
    return {"message": "Email Service is running ✅"}

@app.post("/send-email")
def send_email(data: EmailRequest):
    msg = EmailMessage()
    msg["Subject"] = data.subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = data.receiver

    msg.set_content("This content will appear if the browser does not support HTML")
    msg.add_alternative(data.body, subtype="html")

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)
        return {"message": "HTML Email sent successfully ✅"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


# To run the app in cmd: uvicorn main:app --reload
