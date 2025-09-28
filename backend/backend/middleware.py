# backend/middleware.py
from django.http import JsonResponse
from django.core.exceptions import PermissionDenied
from django.db import DatabaseError
from backend.firebase import db, auth
import logging

logger = logging.getLogger(__name__)

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

def json_error_handler(get_response):
    """
    Middleware to ensure API endpoints always return JSON responses,
    even when errors occur in production.
    """
    def middleware(request):
        # Only apply to API endpoints
        if request.path.startswith('/api/'):
            try:
                response = get_response(request)
                return response
            except Exception as e:
                logger.error(f"API Error for {request.path}: {str(e)}", exc_info=True)
                
                # Return JSON error response instead of HTML
                if isinstance(e, PermissionDenied):
                    return JsonResponse({
                        'error': 'Permission denied',
                        'message': 'You do not have permission to perform this action'
                    }, status=403)
                elif isinstance(e, DatabaseError):
                    return JsonResponse({
                        'error': 'Database error',
                        'message': 'A database error occurred. Please try again later.'
                    }, status=500)
                else:
                    return JsonResponse({
                        'error': 'Internal server error',
                        'message': 'An unexpected error occurred. Please try again later.'
                    }, status=500)
        else:
            return get_response(request)
    
    return middleware