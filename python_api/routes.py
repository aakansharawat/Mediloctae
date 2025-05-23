from flask import Blueprint, request, jsonify
from datetime import datetime
from python_api.models import db, Medicine, Pharmacy
import logging

# Initialize logger
logger = logging.getLogger(__name__)

# Create a Blueprint for API routes
api = Blueprint('api', __name__)

@api.route('/', methods=['GET'])
def api_info():
    """API info endpoint"""
    return jsonify({
        "name": "Medilocate API",
        "version": "1.0.0",
        "endpoints": {
            "search_medicine": "/search_medicine?name=<medicine name>",
            "add_medicine": "/add_medicine (POST)",
            "add_pharmacy": "/add_pharmacy (POST)",
            "health": "/health"
        },
        "example": "/search_medicine?name=aspirin"
    })

@api.route('/add_medicine', methods=['POST'])
def add_medicine():
    """Add a new medicine to the database"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Validate required fields
    required_fields = ['name', 'pharmacy_id']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    try:
        # Check if pharmacy exists
        pharmacy = Pharmacy.query.get(data['pharmacy_id'])
        if not pharmacy:
            return jsonify({"error": f"Pharmacy with ID {data['pharmacy_id']} not found"}), 404
        
        # Process expiry_date if provided
        expiry_date = None
        if 'expiry_date' in data and data['expiry_date']:
            try:
                expiry_date = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({"error": "Invalid expiry date format. Use YYYY-MM-DD"}), 400
        
        # Create new medicine
        medicine = Medicine(
            name=data['name'].lower(),
            expiry_date=expiry_date,
            quantity=data.get('quantity', 0),
            pharmacy_id=data['pharmacy_id']
        )
        
        # Add to database
        db.session.add(medicine)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": f"Medicine '{medicine.name}' added successfully",
            "medicine": medicine.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Database error when adding medicine: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@api.route('/search_medicine', methods=['GET'])
def search_medicine():
    """Search for medicines by name (case-insensitive)"""
    name = request.args.get('name', '').lower()
    
    if not name:
        return jsonify({"error": "No name parameter provided"}), 400
    
    try:
        # Search for medicines in the database
        medicines = Medicine.query.filter(Medicine.name.ilike(f'%{name}%')).all()
        
        # Convert to list of dictionaries
        results = [medicine.to_dict() for medicine in medicines]
        
        return jsonify({
            "query": name,
            "results": results,
            "count": len(results)
        })
    except Exception as e:
        logger.error(f"Database error when searching medicines: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@api.route('/add_pharmacy', methods=['POST'])
def add_pharmacy():
    """Add a new pharmacy to the database"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Validate required fields
    required_fields = ['name', 'address']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    try:
        # Create new pharmacy
        pharmacy = Pharmacy(
            name=data['name'],
            address=data['address'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude')
        )
        
        # Add to database
        db.session.add(pharmacy)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": f"Pharmacy '{pharmacy.name}' added successfully",
            "pharmacy": pharmacy.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Database error when adding pharmacy: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@api.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        pharmacies_count = Pharmacy.query.count()
        medicines_count = Medicine.query.count()
        
        return jsonify({
            "status": "healthy",
            "database": "connected",
            "pharmacies_count": pharmacies_count,
            "medicines_count": medicines_count
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }), 500 