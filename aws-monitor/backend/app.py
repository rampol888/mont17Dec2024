from flask import Flask, jsonify
from flask_cors import CORS
import boto3
from dotenv import load_dotenv
import os
import logging

# Enhanced logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(app)

class AWSMonitor:
    def __init__(self):
        try:
            self.ec2 = boto3.client('ec2')
            self.rds = boto3.client('rds')
            logger.info("AWS clients initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AWS clients: {e}")
            raise

    def get_ec2_status(self):
        try:
            logger.info("Fetching EC2 instances")
            instances = self.ec2.describe_instances()
            result = [{
                'id': instance['InstanceId'],
                'state': instance['State']['Name'],
                'type': instance['InstanceType']
            } for reservation in instances['Reservations']
              for instance in reservation['Instances']]
            logger.info(f"Found {len(result)} EC2 instances")
            return result
        except Exception as e:
            logger.error(f"EC2 Error: {e}")
            return []

    def get_rds_status(self):
        try:
            logger.info("Fetching RDS instances")
            databases = self.rds.describe_db_instances()
            result = [{
                'id': db['DBInstanceIdentifier'],
                'status': db['DBInstanceStatus'],
                'engine': db['Engine']
            } for db in databases['DBInstances']]
            logger.info(f"Found {len(result)} RDS instances")
            return result
        except Exception as e:
            logger.error(f"RDS Error: {e}")
            return []

@app.route('/')
def home():
    logger.info("Home endpoint accessed")
    return jsonify({"message": "AWS Monitor API is running"})

@app.route('/api/status')
def get_status():
    try:
        logger.info("Status endpoint accessed")
        monitor = AWSMonitor()
        response = {
            'ec2': monitor.get_ec2_status(),
            'rds': monitor.get_rds_status()
        }
        logger.info("Status data retrieved successfully")
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error in status endpoint: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Check AWS credentials
    required_env_vars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_DEFAULT_REGION']
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {missing_vars}")
        exit(1)
    
    logger.info("Starting AWS Monitor API on port 5001")
    app.run(debug=True, host='0.0.0.0', port=5001)