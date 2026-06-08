"""
Underwriting Service for NBFC Platform
Handles loan underwriting decisions using ML models and business rules.
"""

import os
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import joblib

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
PORT = int(os.getenv('UNDERWRITING_SERVICE_PORT', 3007))
MODEL_PATH = os.getenv('MODEL_PATH', './models/underwriting_model.pkl')

# Default feature weights for risk assessment
DEFAULT_WEIGHTS = {
    'credit_score': 0.3,
    'income': 0.25,
    'debt_ratio': 0.2,
    'employment_years': 0.15,
    'existing_loans': 0.1
}


def calculate_risk_score(application_data):
    """
    Calculate risk score based on application data.
    Uses a simple scoring model (can be replaced with ML model).
    """
    score = 0
    
    # Credit Score (Normalized to 0-1)
    credit_score = application_data.get('credit_score', 500) / 850
    score += credit_score * DEFAULT_WEIGHTS['credit_score']
    
    # Income (Normalized)
    income = min(application_data.get('annual_income', 0) / 100000, 1)
    score += income * DEFAULT_WEIGHTS['income']
    
    # Debt Ratio (Inverse - lower is better)
    debt_ratio = 1 - min(application_data.get('debt_ratio', 0.5), 1)
    score += debt_ratio * DEFAULT_WEIGHTS['debt_ratio']
    
    # Employment Years (Normalized)
    employment = min(application_data.get('employment_years', 0) / 10, 1)
    score += employment * DEFAULT_WEIGHTS['employment_years']
    
    # Existing Loans (Inverse - fewer is better)
    existing_loans = 1 - min(application_data.get('existing_loans', 2) / 5, 1)
    score += existing_loans * DEFAULT_WEIGHTS['existing_loans']
    
    return round(score * 100, 2)


def get_underwriting_decision(risk_score, amount, tenure):
    """
    Determine underwriting decision based on risk score.
    """
    # Simple decision rules
    if risk_score >= 80:
        return {
            'decision': 'APPROVED',
            'interest_rate': 10.5,
            'max_amount': amount * 2,
            'tenure_limit': 60
        }
    elif risk_score >= 60:
        return {
            'decision': 'APPROVED_WITH_CONDITIONS',
            'interest_rate': 12.5,
            'max_amount': amount,
            'tenure_limit': 48,
            'conditions': ['Co-applicant required', 'Additional documentation needed']
        }
    elif risk_score >= 40:
        return {
            'decision': 'REFER_FOR_REVIEW',
            'interest_rate': 15.0,
            'max_amount': amount * 0.5,
            'tenure_limit': 36,
            'review_required': True
        }
    else:
        return {
            'decision': 'REJECTED',
            'reason': 'Risk score below threshold'
        }


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'underwriting'})


@app.route('/api/underwrite/assess', methods=['POST'])
def assess_application():
    """
    Assess a loan application.
    
    Request Body:
    {
        "applicant_id": "string",
        "credit_score": "int",
        "annual_income": "float",
        "debt_ratio": "float",
        "employment_years": "int",
        "existing_loans": "int",
        "loan_amount": "float",
        "loan_tenure": "int"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['credit_score', 'annual_income', 'loan_amount', 'loan_tenure']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Calculate risk score
        risk_score = calculate_risk_score(data)
        
        # Get decision
        decision = get_underwriting_decision(
            risk_score, 
            data['loan_amount'], 
            data['loan_tenure']
        )
        
        response = {
            'application_id': data.get('applicant_id', 'unknown'),
            'risk_score': risk_score,
            'assessment_date': pd.Timestamp.now().isoformat(),
            **decision
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/underwrite/bulk-assess', methods=['POST'])
def bulk_assess():
    """Assess multiple applications at once."""
    try:
        data = request.get_json()
        applications = data.get('applications', [])
        
        results = []
        for app in applications:
            risk_score = calculate_risk_score(app)
            decision = get_underwriting_decision(
                risk_score,
                app.get('loan_amount', 0),
                app.get('loan_tenure', 0)
            )
            results.append({
                'application_id': app.get('applicant_id', 'unknown'),
                'risk_score': risk_score,
                **decision
            })
        
        return jsonify({'results': results, 'count': len(results)})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=True)