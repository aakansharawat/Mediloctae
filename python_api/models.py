from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from datetime import datetime

# Initialize SQLAlchemy
db = SQLAlchemy()

class Pharmacy(db.Model):
    """Pharmacy model representing pharmacies in the database"""
    __tablename__ = 'pharmacies'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=func.now())
    
    # Relationship with Medicine
    medicines = db.relationship('Medicine', backref='pharmacy', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Pharmacy {self.name}>"
    
    def to_dict(self):
        """Convert Pharmacy object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Medicine(db.Model):
    """Medicine model representing medicines in the database"""
    __tablename__ = 'medicines'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    expiry_date = db.Column(db.Date)
    quantity = db.Column(db.Integer, default=0)
    pharmacy_id = db.Column(db.Integer, db.ForeignKey('pharmacies.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=func.now())
    
    def __repr__(self):
        return f"<Medicine {self.name}>"
    
    def to_dict(self):
        """Convert Medicine object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'quantity': self.quantity,
            'pharmacy_id': self.pharmacy_id,
            'pharmacy_name': self.pharmacy.name if self.pharmacy else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 