import razorpay
from django.conf import settings
from api.models import Transaction, Itinerary
import hmac
import hashlib

class PaymentService:
    def __init__(self):
        self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    def create_order(self, user, itinerary_id):
        itinerary = Itinerary.objects.get(id=itinerary_id)
        amount = int(itinerary.sale_price * 100) # Razorpay expects amount in paise
        
        order_data = {
            'amount': amount,
            'currency': 'INR',
            'payment_capture': '1'
        }
        
        razorpay_order = self.client.order.create(data=order_data)
        
        # Create a pending transaction record
        transaction = Transaction.objects.create(
            user=user,
            itinerary=itinerary,
            amount=itinerary.sale_price,
            status='PENDING',
            razorpay_order_id=razorpay_order['id']
        )
        
        return {
            'order_id': razorpay_order['id'],
            'amount': amount,
            'currency': 'INR',
            'key': settings.RAZORPAY_KEY_ID,
            'itinerary_title': itinerary.title,
            'user_email': user.email,
            'user_phone': getattr(user.profile, 'phone_number', '')
        }

    def verify_payment(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            self.client.utility.verify_payment_signature(params_dict)
            
            # Update transaction
            transaction = Transaction.objects.get(razorpay_order_id=razorpay_order_id)
            transaction.status = 'COMPLETED'
            transaction.razorpay_payment_id = razorpay_payment_id
            transaction.save()
            return True
        except Exception as e:
            print(f"Payment verification failed: {e}")
            return False
