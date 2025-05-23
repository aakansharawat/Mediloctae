from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import medilocate
import csv
import io
import os
import sys
from datetime import datetime
import json

# Try to import our expiry heap module
try:
    import expiry_heap
    has_expiry_tracking = True
except ImportError:
    has_expiry_tracking = False
    print("Warning: expiry_heap module not found. Expiry tracking features will be disabled.", file=sys.stderr)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create and initialize the Trie with medicine names
medicine_trie = medilocate.Trie()

# Create a MinHeap for expiry tracking if available
expiry_tracker = expiry_heap.MinHeap() if has_expiry_tracking else None

# Define the low stock threshold
LOW_STOCK_THRESHOLD = 30

# Add some example medicine names
example_medicines = [
    "aspirin", "acetaminophen", "amoxicillin", "atorvastatin", "azithromycin",
    "buprenorphine", "benzonatate", "budesonide",
    "cephalexin", "ciprofloxacin", "citalopram",
    "doxycycline", "diazepam", "duloxetine",
    "escitalopram", "esomeprazole",
    "fluoxetine", "furosemide",
    "gabapentin", "glipizide",
    "hydrochlorothiazide", "hydrocodone",
    "ibuprofen", "insulin",
    "lisinopril", "levothyroxine",
    "metformin", "metoprolol", "meloxicam",
    "naproxen", "norethindrone",
    "omeprazole", "oxycodone",
    "pantoprazole", "prednisone",
    "quetiapine",
    "rosuvastatin",
    "sertraline", "simvastatin", "sulfamethoxazole",
    "tamsulosin", "trazodone",
    "venlafaxine",
    "warfarin",
    "zolpidem"
]

# Track total number of inserted medicines
inserted_medicines = set()

# Initialize the Trie with example medicines
for medicine in example_medicines:
    medicine = medicine.lower()
    medicine_trie.insert(medicine)
    inserted_medicines.add(medicine)

# Simple in-memory medicine storage for demo
medicines = [
    {"id": 1, "name": "Aspirin", "brand": "Bayer", "quantity": 120, "expiryDate": "2024-12-31"},
    {"id": 2, "name": "Ibuprofen", "brand": "Advil", "quantity": 85, "expiryDate": "2024-06-30"},
    {"id": 3, "name": "Paracetamol", "brand": "Tylenol", "quantity": 50, "expiryDate": "2023-11-15"},
    {"id": 4, "name": "Amoxicillin", "brand": "Amoxil", "quantity": 30, "expiryDate": "2023-12-10"},
    {"id": 5, "name": "Cetirizine", "brand": "Zyrtec", "quantity": 10, "expiryDate": "2025-01-20"},
    {"id": 6, "name": "Loratadine", "brand": "Claritin", "quantity": 25, "expiryDate": "2024-08-15"}
]

# Initialize the MinHeap with example medicines if available
if has_expiry_tracking:
    for med in medicines:
        item = expiry_heap.MedicineItem()
        item.id = med["id"]
        item.name = med["name"]
        item.brand = med["brand"]
        item.quantity = med["quantity"]
        item.expiryDate = med["expiryDate"]
        expiry_tracker.insert(item)

@app.route('/', methods=['GET'])
def api_info():
    # API info endpoint
    return jsonify({
        "name": "Medilocate API",
        "version": "1.0.0",
        "endpoints": {
            "search": "/search?query=<medicine name>",
            "add": "/add (POST)",
            "health": "/health",
            "search_medicine": "/search_medicine?name=<medicine name>",
            "expiring_medicines": "/expiring_medicines",
            "low_stock_medicines": "/low_stock_medicines",
            "upload_medicines": "/upload_medicines (POST)"
        },
        "example": "/search?query=aspirin"
    })

@app.route('/search', methods=['GET'])
def search_medicines():
    query = request.args.get('query', '').lower()
    
    if not query:
        return jsonify({"error": "No query parameter provided"}), 400
    
    if len(query) <= 2:
        results = medicine_trie.startsWith(query)
        return jsonify({
            "query": query,
            "results": results,
            "count": len(results),
            "search_type": "prefix"
        })
    
    exact_match = medicine_trie.search(query)
    
    if exact_match:
        return jsonify({
            "query": query,
            "results": [query],
            "count": 1,
            "search_type": "exact"
        })
    
    results = medicine_trie.startsWith(query)
    return jsonify({
        "query": query,
        "results": results,
        "count": len(results),
        "search_type": "prefix"
    })

@app.route('/add', methods=['POST'])
def add_medicine():
    data = request.get_json()
    
    if not data or 'medicine' not in data:
        return jsonify({"error": "No medicine name provided"}), 400
    
    medicine_name = data['medicine'].strip().lower()

    if medicine_name in inserted_medicines:
        return jsonify({
            "status": "exists",
            "message": f"{medicine_name} already exists in the medicine database"
        })

    medicine_trie.insert(medicine_name)
    inserted_medicines.add(medicine_name)
    
    return jsonify({
        "status": "success",
        "message": f"Added {medicine_name} to the medicine database"
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "medicines_count": len(inserted_medicines),
        "expiry_tracking_available": has_expiry_tracking
    })

@app.route('/ping', methods=['GET'])
def ping():
    """Simple health check endpoint"""
    return {"status": "ok", "message": "Medilocate API is running"}

@app.route('/search_medicine', methods=['GET'])
def search_medicine_db():
    name = request.args.get('name', '').lower()
    
    if not name:
        return jsonify({"error": "No name parameter provided"}), 400
    
    # Search for medicines in the in-memory list
    results = [medicine for medicine in medicines if name in medicine['name'].lower()]
    
    return jsonify({"results": results})

@app.route('/expiring_medicines', methods=['GET'])
def expiring_medicines():
    """Get medicines sorted by expiry date (earliest first)"""
    if not has_expiry_tracking:
        # Fallback if C++ module is not available
        sorted_meds = sorted(medicines, key=lambda m: m['expiryDate'])
        return jsonify({"results": sorted_meds})
    
    # Use the C++ MinHeap implementation
    sorted_items = expiry_tracker.getSortedItems()
    
    # Convert C++ objects to Python dictionaries
    results = []
    for item in sorted_items:
        results.append({
            "id": item.id,
            "name": item.name,
            "brand": item.brand,
            "quantity": item.quantity,
            "expiryDate": item.expiryDate
        })
    
    return jsonify({"results": results})

@app.route('/low_stock_medicines', methods=['GET'])
def low_stock_medicines():
    """Get medicines with low stock (below threshold)"""
    global LOW_STOCK_THRESHOLD
    
    # Get threshold from query parameter, or use default
    threshold = request.args.get('threshold', type=int)
    if threshold is not None:
        current_threshold = threshold
    else:
        current_threshold = LOW_STOCK_THRESHOLD
    
    # Filter medicines below threshold
    low_stock = [m for m in medicines if m['quantity'] <= current_threshold]
    
    # Sort by quantity (ascending)
    low_stock.sort(key=lambda m: m['quantity'])
    
    return jsonify({
        "results": low_stock,
        "threshold": current_threshold
    })

@app.route('/upload_medicines', methods=['POST'])
def upload_medicines():
    """Upload medicines via CSV file"""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "File must be CSV format"}), 400
    
    # Process the CSV file
    try:
        # Read the CSV file
        stream = io.StringIO(file.stream.read().decode('utf-8'), newline='')
        csv_reader = csv.DictReader(stream)
        
        # Validate CSV structure
        required_fields = ['name', 'brand', 'quantity', 'expiryDate']
        if not all(field in csv_reader.fieldnames for field in required_fields):
            return jsonify({
                "error": "CSV file must contain columns: name, brand, quantity, expiryDate"
            }), 400
        
        # Process the medicines
        new_medicines = []
        for row in csv_reader:
            try:
                medicine = {
                    "id": len(medicines) + len(new_medicines) + 1,
                    "name": row['name'].strip(),
                    "brand": row['brand'].strip(),
                    "quantity": int(row['quantity']),
                    "expiryDate": row['expiryDate'].strip()
                }
                
                # Add to in-memory store
                new_medicines.append(medicine)
                
                # Add to Trie for search
                medicine_trie.insert(medicine['name'].lower())
                inserted_medicines.add(medicine['name'].lower())
                
                # Add to MinHeap for expiry tracking if available
                if has_expiry_tracking:
                    item = expiry_heap.MedicineItem()
                    item.id = medicine['id']
                    item.name = medicine['name']
                    item.brand = medicine['brand']
                    item.quantity = medicine['quantity']
                    item.expiryDate = medicine['expiryDate']
                    expiry_tracker.insert(item)
                
            except Exception as e:
                return jsonify({"error": f"Error processing row: {str(e)}"}), 400
        
        # Add all new medicines to the in-memory store
        medicines.extend(new_medicines)
        
        return jsonify({
            "status": "success",
            "message": f"Uploaded {len(new_medicines)} medicines",
            "medicines": new_medicines
        })
        
    except Exception as e:
        return jsonify({"error": f"Error processing CSV: {str(e)}"}), 500

@app.route('/add_medicine_item', methods=['POST'])
def add_medicine_item():
    """Add a single medicine item"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Validate required fields
    required_fields = ['name', 'brand', 'quantity', 'expiryDate']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    try:
        # Create new medicine
        medicine = {
            "id": len(medicines) + 1,
            "name": data['name'].strip(),
            "brand": data['brand'].strip(),
            "quantity": int(data['quantity']),
            "expiryDate": data['expiryDate'].strip()
        }
        
        # Add to in-memory store
        medicines.append(medicine)
        
        # Add to Trie for search
        medicine_trie.insert(medicine['name'].lower())
        inserted_medicines.add(medicine['name'].lower())
        
        # Add to MinHeap for expiry tracking if available
        if has_expiry_tracking:
            item = expiry_heap.MedicineItem()
            item.id = medicine['id']
            item.name = medicine['name']
            item.brand = medicine['brand']
            item.quantity = medicine['quantity']
            item.expiryDate = medicine['expiryDate']
            expiry_tracker.insert(item)
        
        return jsonify({
            "status": "success",
            "message": f"Added medicine: {medicine['name']}",
            "medicine": medicine
        })
        
    except Exception as e:
        return jsonify({"error": f"Error adding medicine: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
