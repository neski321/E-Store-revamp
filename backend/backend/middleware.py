# backend/middleware.py
from django.http import JsonResponse
from backend.firebase import db

def check_user_role(get_response):
    def middleware(request):
        if 'Authorization' in request.headers:
            id_token = request.headers['Authorization'].split(' ').pop()
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            # Retrieve user role from Firestore or your database
            user_role = get_user_role_from_db(uid)
            request.user_role = user_role
        else:
            request.user_role = None

        response = get_response(request)
        return response

    return middleware

def get_user_role_from_db(uid):
    try:
        user_doc = db.collection('roles').document(uid).get()
        if user_doc.exists:
            return user_doc.to_dict().get('role', 'user')  # Default to 'user' if role not found
        else:
            return 'user'  # Default to 'user' if document does not exist
    except Exception as e:
        print(f"Error retrieving user role: {e}")
        return 'user'  # Default to 'user' in case of error