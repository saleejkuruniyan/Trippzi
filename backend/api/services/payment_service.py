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
        sale_price = itinerary.sale_price
        
        # Always use current global price for custom itineraries if not owned
        if itinerary.is_custom:
            from api.models import SiteSettings
            settings_obj = SiteSettings.get_settings()
            sale_price = settings_obj.custom_itinerary_price
            
        amount = int(sale_price * 100) # Razorpay expects amount in paise
        
        order_data = {
            'amount': amount,
            'currency': 'INR',
            'payment_capture': '1'
        }
        
        if getattr(settings, 'MOCK_PAYMENT', False):
            # Immediately complete purchase
            Transaction.objects.get_or_create(
                user=user,
                itinerary=itinerary,
                amount=sale_price,
                status='COMPLETED',
                razorpay_order_id=f"mock_order_{itinerary_id}_{user.id}"
            )
            return {
                'status': 'mock_success', 
                'itinerary_id': itinerary_id,
                'message': 'Mock payment completed successfully'
            }

        razorpay_order = self.client.order.create(data=order_data)
        
        # Create a pending transaction record
        transaction = Transaction.objects.create(
            user=user,
            itinerary=itinerary,
            amount=sale_price,
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
