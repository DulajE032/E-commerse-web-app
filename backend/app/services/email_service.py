import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_admin_new_order_email(order_id: int, customer_email: str, total_amount: float):
    """Send an email notification to the administrator about a new order."""
    if not settings.ADMIN_EMAIL:
        logger.warning("ADMIN_EMAIL is not configured. Skipping email notification.")
        return

    subject = f"New Order Placed: #{order_id}"
    body = (
        f"Hello Admin,\n\n"
        f"A new order has been placed on the store.\n\n"
        f"Order ID: #{order_id}\n"
        f"Customer Email: {customer_email}\n"
        f"Total Amount: ${total_amount:.2f}\n\n"
        f"Please log in to the admin panel to review and manage this order."
    )

    message = MIMEMultipart()
    message["From"] = settings.EMAILS_FROM_EMAIL
    message["To"] = settings.ADMIN_EMAIL
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    try:
        if settings.SMTP_SSL:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            if settings.SMTP_TLS:
                server.starttls()

        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

        server.sendmail(settings.EMAILS_FROM_EMAIL, settings.ADMIN_EMAIL, message.as_string())
        server.quit()
        logger.info(f"Successfully sent admin notification email for order #{order_id}")
    except Exception as e:
        logger.error(f"Failed to send admin email notification for order #{order_id}: {e}")
