#!/usr/bin/env python3
"""
Test script for stock update functionality
"""

import requests
import json

# Test data
test_order_items = [
    {
        "productId": 1,  # Assuming product with ID 1 exists
        "quantity": 2
    },
    {
        "productId": 2,  # Assuming product with ID 2 exists
        "quantity": 1
    }
]

def test_stock_update():
    """Test the stock update API endpoint"""
    
    url = "http://localhost:8000/api/update-stock/"
    
    payload = {
        "orderItems": test_order_items
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print("Testing stock update API...")
        print(f"URL: {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(url, json=payload, headers=headers)
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success! Response: {json.dumps(result, indent=2)}")
            
            if result.get('updatedProducts'):
                print(f"\n✅ Successfully updated {len(result['updatedProducts'])} products")
                for product in result['updatedProducts']:
                    print(f"  - {product['productName']}: Sold {product['quantitySold']}, Remaining: {product['remainingStock']}")
            
            if result.get('failedUpdates'):
                print(f"\n⚠️  {len(result['failedUpdates'])} products failed to update:")
                for failure in result['failedUpdates']:
                    print(f"  - Product {failure['productId']}: {failure['error']}")
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the Django server is running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_stock_update()
