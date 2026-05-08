import sys
import os
sys.path.append(os.path.abspath('c:/Users/verma/Desktop/certichain-aura-main (2)/certichain-aura-main/backend'))

from app.services.email_service import send_report_email

result = send_report_email(
    user_email="vermashivi072@gmail.com",
    certificate_name="Test Certificate",
    certificate_id="test123abc",
    status="real",
    score=0.96,
    ai_summary="This is a test email from CertiChain Aura to verify the email system is working correctly.",
    pdf_bytes=None,
)

print("Email sent successfully!" if result else "Email sending FAILED!")
