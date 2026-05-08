import numpy as np
from sklearn.ensemble import IsolationForest
import logging

logger = logging.getLogger(__name__)

class CertiChainML:
    """
    Machine Learning module for Anomaly and Fraud Detection.
    Uses Isolation Forest to identify outliers in scan metadata.
    """
    
    def __init__(self):
        # Initialize Isolation Forest
        # contamination=0.1 means we expect roughly 10% anomalies in the dataset
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.is_trained = False

    def train_on_history(self, history_data: list[dict]):
        """
        Trains the model on historical scan results to learn the 'normal' pattern.
        Features: [authenticity_score, fraud_probability, tamper_score, confidence_score]
        """
        if len(history_data) < 5:
            logger.warning("Not enough data to train ML model. Need at least 5 records.")
            return

        features = []
        for doc in history_data:
            features.append([
                doc.get("authenticity_score", 0.5),
                doc.get("fraud_probability", 0.5),
                doc.get("tamper_score", 0.1),
                doc.get("nlp_confidence", 0.8)
            ])
        
        X = np.array(features)
        self.model.fit(X)
        self.is_trained = True
        logger.info("CertiChain ML Anomaly model trained successfully.")

    def detect_anomaly(self, authenticity_score, fraud_probability, tamper_score, nlp_confidence):
        """
        Detects if a current scan is an anomaly based on learned history.
        Returns: 1 for normal, -1 for anomaly (suspicious pattern)
        """
        if not self.is_trained:
            # Fallback to simple logic if not enough history
            return 1 if authenticity_score > 0.5 else -1
            
        X_current = np.array([[authenticity_score, fraud_probability, tamper_score, nlp_confidence]])
        prediction = self.model.predict(X_current)
        return int(prediction[0])

# Global instance
ml_engine = CertiChainML()

def run_anomaly_detection(db_records: list, current_features: dict):
    """
    Helper to run ML detection in the audit pipeline.
    """
    if db_records:
        ml_engine.train_on_history(db_records)
    
    result = ml_engine.detect_anomaly(
        current_features["authenticity_score"],
        current_features["fraud_probability"],
        current_features["tamper_score"],
        current_features["nlp_confidence"]
    )
    
    return {
        "is_anomaly": result == -1,
        "ml_confidence": 0.85 if result == 1 else 0.35,
        "model_type": "Isolation Forest (Unsupervised ML)"
    }
