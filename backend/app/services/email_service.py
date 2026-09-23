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


def send_bank_transfer_instructions_email(customer_email: str, order_id: int, reference_number: str, total_amount: float):
    """Send bank transfer instructions with payment reference to customer."""
    if not customer_email:
        return

    subject = f"Bank Transfer Instructions - Order #{order_id} (Ref: {reference_number})"
    body = (
        f"Dear Customer,\n\n"
        f"Thank you for your order #{order_id}!\n\n"
        f"To complete your order, please make a bank transfer using the details below:\n\n"
        f"-----------------------------------------\n"
        f"BANK TRANSFER PAYMENT DETAILS\n"
        f"-----------------------------------------\n"
        f"Bank Name: Commercial Bank\n"
        f"Account Name: E-Commerce Store (Pvt) Ltd\n"
        f"Account Number: 1000 2345 6789\n"
        f"Branch: Colombo City Branch\n"
        f"Total Amount Due: ${total_amount:.2f}\n"
        f"YOUR PAYMENT REFERENCE: {reference_number}\n"
        f"-----------------------------------------\n\n"
        f"IMPORTANT:\n"
        f"Please include your payment reference ({reference_number}) in the transfer remarks/narration.\n"
        f"Once the transfer is complete, please upload your transfer slip in your account dashboard.\n\n"
        f"Thank you for shopping with us!"
    )

    message = MIMEMultipart()
    message["From"] = settings.EMAILS_FROM_EMAIL or "noreply@ecommerce.com"
    message["To"] = customer_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    try:
        if not settings.SMTP_HOST:
            logger.info(f"SMTP not configured. Bank transfer email simulated for Order #{order_id}: Ref {reference_number}")
            return

        if settings.SMTP_SSL:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            if settings.SMTP_TLS:
                server.starttls()

        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

        server.sendmail(settings.EMAILS_FROM_EMAIL or "noreply@ecommerce.com", customer_email, message.as_string())
        server.quit()
        logger.info(f"Successfully sent bank transfer email for order #{order_id} to {customer_email}")
    except Exception as e:
        logger.error(f"Failed to send bank transfer email to {customer_email}: {e}")


def send_payment_verified_email(customer_email: str, order_id: int, total_amount: float):
    """Send payment verified confirmation email to customer."""
    if not customer_email:
        return

    subject = f"Payment Verified - Order #{order_id} Confirmed"
    body = (
        f"Dear Customer,\n\n"
        f"Good news! Your bank transfer payment of ${total_amount:.2f} for Order #{order_id} has been verified.\n\n"
        f"Your order is now confirmed and our team is preparing it for shipment.\n"
        f"You can track the progress of your order at any time from your account dashboard.\n\n"
        f"Thank you for choosing our store!"
    )

    message = MIMEMultipart()
    message["From"] = settings.EMAILS_FROM_EMAIL or "noreply@ecommerce.com"
    message["To"] = customer_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    try:
        if not settings.SMTP_HOST:
            logger.info(f"SMTP not configured. Payment verified email simulated for Order #{order_id}")
            return

        if settings.SMTP_SSL:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            if settings.SMTP_TLS:
                server.starttls()

        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

        server.sendmail(settings.EMAILS_FROM_EMAIL or "noreply@ecommerce.com", customer_email, message.as_string())
        server.quit()
        logger.info(f"Successfully sent payment verified email for order #{order_id} to {customer_email}")
    except Exception as e:
        logger.error(f"Failed to send payment verified email for order #{order_id}: {e}")


def send_payment_rejected_email(customer_email: str, order_id: int, reason: str):
    """Send payment rejected notification email to customer."""
    if not customer_email:
        return

    subject = f"Action Required: Payment Slip Rejected - Order #{order_id}"
    body = (
        f"Dear Customer,\n\n"
        f"We were unable to verify your bank transfer slip for Order #{order_id}.\n\n"
        f"Reason / Admin Notes:\n"
        f"{reason}\n\n"
        f"What to do next:\n"
        f"Please log in to your account dashboard, review the notes, and re-upload a valid payment slip showing the correct order amount and reference.\n\n"
        f"If you believe this is a mistake or have questions, please reply to this email or contact support.\n\n"
        f"Thank you."
    )

    message = MIMEMultipart()
    message["From"] = settings.EMAILS_FROM_EMAIL or "noreply@ecommerce.com"
    message["To"] = customer_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    try:
        if not settings.SMTP_HOST:
            logger.info(f"SMTP not configured. Payment rejected email simulated for Order #{order_id}")
            return

        if settings.SMTP_SSL:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            if settings.SMTP_TLS:
                server.starttls()

        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

        server.sendmail(settings.EMAILS_FROM_EMAIL or "noreply@ecommerce.com", customer_email, message.as_string())
        server.quit()
        logger.info(f"Successfully sent payment rejected email for order #{order_id} to {customer_email}")
    except Exception as e:
        logger.error(f"Failed to send payment rejected email for order #{order_id}: {e}")


