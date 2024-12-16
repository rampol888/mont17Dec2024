from flask import Flask, jsonify, request
from flask_cors import CORS
import boto3
from dotenv import load_dotenv
import os
import logging
from datetime import datetime, timedelta
import random
import requests
from urllib.parse import urlparse
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

class AWSMonitor:
    def __init__(self):
        try:
            self.ec2 = boto3.client('ec2')
            self.rds = boto3.client('rds')
            self.logs = boto3.client('logs')
            self.cloudwatch = boto3.client('cloudwatch')
            self.cloudfront = boto3.client('cloudfront')
            logger.info("AWS clients initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AWS clients: {e}")
            raise

    def get_ec2_status(self):
        try:
            logger.info("Fetching EC2 instances")
            instances = self.ec2.describe_instances()
            result = []
            
            for reservation in instances['Reservations']:
                for instance in reservation['Instances']:
                    # Get CPU utilization for this instance
                    end_time = datetime.utcnow()
                    start_time = end_time - timedelta(minutes=5)
                    
                    cpu_stats = self.cloudwatch.get_metric_statistics(
                        Namespace='AWS/EC2',
                        MetricName='CPUUtilization',
                        Dimensions=[
                            {
                                'Name': 'InstanceId',
                                'Value': instance['InstanceId']
                            }
                        ],
                        StartTime=start_time,
                        EndTime=end_time,
                        Period=300,  # 5 minutes
                        Statistics=['Average']
                    )
                    
                    # Get the latest CPU utilization value
                    cpu_utilization = None
                    if cpu_stats['Datapoints']:
                        latest_datapoint = max(cpu_stats['Datapoints'], key=lambda x: x['Timestamp'])
                        cpu_utilization = round(latest_datapoint['Average'], 2)
                    
                    instance_data = {
                        'id': instance['InstanceId'],
                        'state': instance['State']['Name'],
                        'type': instance['InstanceType'],
                        'launch_time': instance['LaunchTime'].isoformat() if 'LaunchTime' in instance else None,
                        'cpuUtilization': cpu_utilization
                    }
                    result.append(instance_data)
                    
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

    def get_log_groups(self):
        try:
            logger.info("Fetching CloudWatch Log Groups")
            response = self.logs.describe_log_groups()
            return [group['logGroupName'] for group in response['logGroups']]
        except Exception as e:
            logger.error(f"Log Groups Error: {e}")
            return []

    def get_log_events(self, log_group_name, start_time=None, filter_pattern=None):
        try:
            logger.info(f"Fetching logs from {log_group_name}")
            kwargs = {
                'logGroupName': log_group_name,
                'limit': 100,  # Adjust as needed
                'startFromHead': False
            }
            
            if start_time:
                kwargs['startTime'] = start_time
            
            if filter_pattern:
                kwargs['filterPattern'] = filter_pattern

            response = self.logs.filter_log_events(**kwargs)
            return [{
                'timestamp': event['timestamp'],
                'message': event['message'],
                'logStreamName': event['logStreamName']
            } for event in response['events']]
        except Exception as e:
            logger.error(f"Log Events Error: {e}")
            return []

    def monitor_website(self, url):
        try:
            logger.info(f"Monitoring website: {url}")
            response = self.cloudwatch.get_metric_data(
                MetricDataQueries=[
                    {
                        'Id': 'availability',
                        'MetricStat': {
                            'Metric': {
                                'Namespace': 'AWS/Route53',
                                'MetricName': 'HealthCheckStatus',
                                'Dimensions': [
                                    {'Name': 'HealthCheckId', 'Value': url}
                                ]
                            },
                            'Period': 300,
                            'Stat': 'Average'
                        }
                    },
                    {
                        'Id': 'latency',
                        'MetricStat': {
                            'Metric': {
                                'Namespace': 'AWS/Route53',
                                'MetricName': 'TimeToFirstByte',
                                'Dimensions': [
                                    {'Name': 'HealthCheckId', 'Value': url}
                                ]
                            },
                            'Period': 300,
                            'Stat': 'Average'
                        }
                    }
                ],
                StartTime=datetime.utcnow() - timedelta(hours=1),
                EndTime=datetime.utcnow()
            )
            
            return {
                'url': url,
                'status': 'Available' if response['MetricDataResults'][0]['Values'] else 'Unavailable',
                'latency': response['MetricDataResults'][1]['Values'][-1] if response['MetricDataResults'][1]['Values'] else None,
                'lastChecked': datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Website monitoring error for {url}: {e}")
            return {
                'url': url,
                'status': 'Error',
                'latency': None,
                'lastChecked': datetime.utcnow().isoformat(),
                'error': str(e)
            }

    def get_cpu_utilization(self):
        try:
            logger.info("Fetching CPU utilization metrics")
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(minutes=5)  # Last 5 minutes of data

            response = self.cloudwatch.get_metric_statistics(
                Namespace='AWS/EC2',
                MetricName='CPUUtilization',
                Dimensions=[],  # Empty list to get all instances
                StartTime=start_time,
                EndTime=end_time,
                Period=300,  # 5-minute periods
                Statistics=['Average']
            )

            # Process the metrics data
            metrics = [{
                'timestamp': datapoint['Timestamp'].isoformat(),
                'average': datapoint['Average']
            } for datapoint in response['Datapoints']]

            logger.info(f"Retrieved {len(metrics)} CPU utilization datapoints")
            return metrics
        except Exception as e:
            logger.error(f"CPU Utilization Error: {e}")
            return []

    def get_memory_utilization(self):
        try:
            logger.info("Fetching Memory utilization metrics")
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(minutes=5)

            response = self.cloudwatch.get_metric_statistics(
                Namespace='AWS/EC2',
                MetricName='MemoryUtilization',
                Dimensions=[],
                StartTime=start_time,
                EndTime=end_time,
                Period=300,
                Statistics=['Average']
            )
            return response['Datapoints']
        except Exception as e:
            logger.error(f"Memory Utilization Error: {e}")
            return []

    def get_network_metrics(self):
        try:
            logger.info("Fetching Network metrics")
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(minutes=5)

            metrics = {}
            for metric in ['NetworkIn', 'NetworkOut']:
                response = self.cloudwatch.get_metric_statistics(
                    Namespace='AWS/EC2',
                    MetricName=metric,
                    Dimensions=[],
                    StartTime=start_time,
                    EndTime=end_time,
                    Period=300,
                    Statistics=['Average']
                )
                metrics[metric] = response['Datapoints']
            return metrics
        except Exception as e:
            logger.error(f"Network Metrics Error: {e}")
            return {}

    def get_disk_metrics(self):
        try:
            logger.info("Fetching disk space metrics")
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(minutes=30)

            # Get disk space utilization
            disk_used = self.cloudwatch.get_metric_statistics(
                Namespace='AWS/EC2',
                MetricName='DiskSpaceUtilization',
                Dimensions=[
                    {
                        'Name': 'InstanceId',
                        'Value': 'i-0f243abfe9666ad29'  # Replace with your instance ID
                    },
                    {
                        'Name': 'Filesystem',
                        'Value': '/dev/xvda1'  # Replace with your filesystem
                    },
                    {
                        'Name': 'MountPath',
                        'Value': '/'
                    }
                ],
                StartTime=start_time,
                EndTime=end_time,
                Period=300,
                Statistics=['Average']
            )

            # Get disk space available
            disk_available = self.cloudwatch.get_metric_statistics(
                Namespace='AWS/EC2',
                MetricName='DiskSpaceAvailable',
                Dimensions=[
                    {
                        'Name': 'InstanceId',
                        'Value': 'i-0f243abfe9666ad29'  # Replace with your instance ID
                    },
                    {
                        'Name': 'Filesystem',
                        'Value': '/dev/xvda1'  # Replace with your filesystem
                    },
                    {
                        'Name': 'MountPath',
                        'Value': '/'
                    }
                ],
                StartTime=start_time,
                EndTime=end_time,
                Period=300,
                Statistics=['Average']
            )

            return {
                'disk_used': disk_used['Datapoints'],
                'disk_available': disk_available['Datapoints'],
                'total_size': sum(point['Average'] for point in disk_used['Datapoints'] + disk_available['Datapoints']) if disk_used['Datapoints'] and disk_available['Datapoints'] else 0
            }
        except Exception as e:
            logger.error(f"Disk Metrics Error: {e}")
            return {}

    def get_cloud_metrics(self):
        try:
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(minutes=30)
            
            metrics = {
                'compute': self.cloudwatch.get_metric_statistics(
                    Namespace='AWS/EC2',
                    MetricName='CPUUtilization',
                    StartTime=start_time,
                    EndTime=end_time,
                    Period=300,
                    Statistics=['Average']
                ),
                'memory': self.cloudwatch.get_metric_statistics(
                    Namespace='AWS/EC2',
                    MetricName='MemoryUtilization',
                    StartTime=start_time,
                    EndTime=end_time,
                    Period=300,
                    Statistics=['Average']
                ),
                'network': self.cloudwatch.get_metric_statistics(
                    Namespace='AWS/EC2',
                    MetricName='NetworkIn',
                    StartTime=start_time,
                    EndTime=end_time,
                    Period=300,
                    Statistics=['Sum']
                )
            }
            return metrics
        except Exception as e:
            logger.error(f"Cloud Metrics Error: {e}")
            return {}

    def get_db_latency_metrics(self):
        try:
            logger.info("Fetching database latency metrics")
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(minutes=30)

            # Get RDS latency metrics
            latency_metrics = self.cloudwatch.get_metric_statistics(
                Namespace='AWS/RDS',
                MetricName='ReadLatency',
                Dimensions=[
                    {
                        'Name': 'DBInstanceIdentifier',
                        'Value': 'p2p-exchange'  # Replace with your DB identifier
                    }
                ],
                StartTime=start_time,
                EndTime=end_time,
                Period=300,
                Statistics=['Average']
            )

            # Get write latency as well
            write_latency = self.cloudwatch.get_metric_statistics(
                Namespace='AWS/RDS',
                MetricName='WriteLatency',
                Dimensions=[
                    {
                        'Name': 'DBInstanceIdentifier',
                        'Value': 'p2p-exchange'  # Replace with your DB identifier
                    }
                ],
                StartTime=start_time,
                EndTime=end_time,
                Period=300,
                Statistics=['Average']
            )

            return {
                'read_latency': latency_metrics['Datapoints'],
                'write_latency': write_latency['Datapoints']
            }
        except Exception as e:
            logger.error(f"Database Latency Metrics Error: {e}")
            return {}

    def get_website_performance(self):
        try:
            logger.info("Fetching website performance metrics")
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(hours=24)

            # Simulated data for testing
            time_points = []
            current = start_time
            while current <= end_time:
                time_points.append(current)
                current += timedelta(minutes=30)

            # Generate sample data
            return {
                'responseTime': {
                    'average': [
                        {
                            'timestamp': t.isoformat(),
                            'value': round(random.uniform(0.1, 2.0), 2)
                        } for t in time_points
                    ],
                    'maximum': [
                        {
                            'timestamp': t.isoformat(),
                            'value': round(random.uniform(1.0, 5.0), 2)
                        } for t in time_points
                    ]
                },
                'errorRate': [
                    {
                        'timestamp': t.isoformat(),
                        'value': round(random.uniform(0, 2.0), 2)
                    } for t in time_points
                ],
                'requests': [
                    {
                        'timestamp': t.isoformat(),
                        'value': random.randint(100, 1000)
                    } for t in time_points
                ],
                'bandwidth': [
                    {
                        'timestamp': t.isoformat(),
                        'value': random.randint(1024 * 1024, 10 * 1024 * 1024)  # 1MB to 10MB
                    } for t in time_points
                ]
            }
        except Exception as e:
            logger.error(f"Website Performance Error: {e}")
            return {}

    def test_webpage_speed(self, url):
        try:
            logger.info(f"Testing webpage speed for: {url}")
            start_time = time.time()
            
            # Validate URL
            parsed_url = urlparse(url)
            if not parsed_url.scheme:
                url = f"https://{url}"

            # Perform the request
            response = requests.get(url, timeout=30)
            end_time = time.time()

            # Calculate metrics
            total_time = end_time - start_time
            page_size = len(response.content)
            
            # Get headers for additional info
            server = response.headers.get('Server', 'Unknown')
            content_type = response.headers.get('Content-Type', 'Unknown')
            
            return {
                'url': url,
                'loadTime': round(total_time * 1000, 2),  # Convert to milliseconds
                'pageSize': page_size,
                'statusCode': response.status_code,
                'server': server,
                'contentType': content_type,
                'timestamp': datetime.utcnow().isoformat(),
                'headers': dict(response.headers),
                'metrics': {
                    'ttfb': round(response.elapsed.total_seconds() * 1000, 2),  # Time to First Byte
                    'downloadTime': round((total_time - response.elapsed.total_seconds()) * 1000, 2),
                    'dnsLookup': 0,  # Would need DNS lookup timing
                    'sslTime': 0,    # Would need SSL negotiation timing
                }
            }
        except Exception as e:
            logger.error(f"Webpage Speed Test Error: {e}")
            return {
                'url': url,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

    def get_server_metrics(self):
        try:
            logger.info("Fetching server metrics")
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(hours=1)

            metrics = {
                'cpu': self.cloudwatch.get_metric_statistics(
                    Namespace='AWS/EC2',
                    MetricName='CPUUtilization',
                    Dimensions=[],
                    StartTime=start_time,
                    EndTime=end_time,
                    Period=300,
                    Statistics=['Average', 'Maximum']
                ),
                'memory': self.cloudwatch.get_metric_statistics(
                    Namespace='CWAgent',
                    MetricName='mem_used_percent',
                    Dimensions=[],
                    StartTime=start_time,
                    EndTime=end_time,
                    Period=300,
                    Statistics=['Average']
                ),
                'disk': self.cloudwatch.get_metric_statistics(
                    Namespace='CWAgent',
                    MetricName='disk_used_percent',
                    Dimensions=[],
                    StartTime=start_time,
                    EndTime=end_time,
                    Period=300,
                    Statistics=['Average']
                ),
                'network': {
                    'in': self.cloudwatch.get_metric_statistics(
                        Namespace='AWS/EC2',
                        MetricName='NetworkIn',
                        Dimensions=[],
                        StartTime=start_time,
                        EndTime=end_time,
                        Period=300,
                        Statistics=['Average']
                    ),
                    'out': self.cloudwatch.get_metric_statistics(
                        Namespace='AWS/EC2',
                        MetricName='NetworkOut',
                        Dimensions=[],
                        StartTime=start_time,
                        EndTime=end_time,
                        Period=300,
                        Statistics=['Average']
                    )
                }
            }

            return {
                'cpu': {
                    'current': metrics['cpu']['Datapoints'][-1]['Average'] if metrics['cpu']['Datapoints'] else 0,
                    'history': [
                        {
                            'timestamp': point['Timestamp'].isoformat(),
                            'value': point['Average']
                        } for point in metrics['cpu']['Datapoints']
                    ]
                },
                'memory': {
                    'current': metrics['memory']['Datapoints'][-1]['Average'] if metrics['memory']['Datapoints'] else 0,
                    'history': [
                        {
                            'timestamp': point['Timestamp'].isoformat(),
                            'value': point['Average']
                        } for point in metrics['memory']['Datapoints']
                    ]
                },
                'disk': {
                    'current': metrics['disk']['Datapoints'][-1]['Average'] if metrics['disk']['Datapoints'] else 0,
                    'history': [
                        {
                            'timestamp': point['Timestamp'].isoformat(),
                            'value': point['Average']
                        } for point in metrics['disk']['Datapoints']
                    ]
                },
                'network': {
                    'in': [
                        {
                            'timestamp': point['Timestamp'].isoformat(),
                            'value': point['Average']
                        } for point in metrics['network']['in']['Datapoints']
                    ],
                    'out': [
                        {
                            'timestamp': point['Timestamp'].isoformat(),
                            'value': point['Average']
                        } for point in metrics['network']['out']['Datapoints']
                    ]
                }
            }
        except Exception as e:
            logger.error(f"Server Metrics Error: {e}")
            return {}

    def get_response_time_metrics(self):
        try:
            logger.info("Fetching response time metrics")
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(hours=24)

            metrics = {
                'api_latency': self.cloudwatch.get_metric_statistics(
                    Namespace='AWS/ApiGateway',
                    MetricName='Latency',
                    Dimensions=[],
                    StartTime=start_time,
                    EndTime=end_time,
                    Period=300,
                    Statistics=['Average', 'Maximum', 'Minimum']
                ),
                'integration_latency': self.cloudwatch.get_metric_statistics(
                    Namespace='AWS/ApiGateway',
                    MetricName='IntegrationLatency',
                    Dimensions=[],
                    StartTime=start_time,
                    EndTime=end_time,
                    Period=300,
                    Statistics=['Average', 'Maximum']
                ),
                'endpoint_latency': {
                    'endpoint1': self.cloudwatch.get_metric_statistics(
                        Namespace='AWS/ApiGateway',
                        MetricName='Latency',
                        Dimensions=[{'Name': 'ApiName', 'Value': 'endpoint1'}],
                        StartTime=start_time,
                        EndTime=end_time,
                        Period=300,
                        Statistics=['Average']
                    )
                }
            }

            return {
                'apiLatency': {
                    'current': metrics['api_latency']['Datapoints'][-1]['Average'] if metrics['api_latency']['Datapoints'] else 0,
                    'history': {
                        'average': [
                            {
                                'timestamp': point['Timestamp'].isoformat(),
                                'value': point['Average']
                            } for point in metrics['api_latency']['Datapoints']
                        ],
                        'maximum': [
                            {
                                'timestamp': point['Timestamp'].isoformat(),
                                'value': point['Maximum']
                            } for point in metrics['api_latency']['Datapoints']
                        ],
                        'minimum': [
                            {
                                'timestamp': point['Timestamp'].isoformat(),
                                'value': point['Minimum']
                            } for point in metrics['api_latency']['Datapoints']
                        ]
                    }
                },
                'integrationLatency': {
                    'current': metrics['integration_latency']['Datapoints'][-1]['Average'] if metrics['integration_latency']['Datapoints'] else 0,
                    'history': [
                        {
                            'timestamp': point['Timestamp'].isoformat(),
                            'value': point['Average']
                        } for point in metrics['integration_latency']['Datapoints']
                    ]
                },
                'endpointLatency': {
                    'endpoint1': [
                        {
                            'timestamp': point['Timestamp'].isoformat(),
                            'value': point['Average']
                        } for point in metrics['endpoint_latency']['endpoint1']['Datapoints']
                    ]
                }
            }
        except Exception as e:
            logger.error(f"Response Time Metrics Error: {e}")
            return {}

@app.route('/')
def home():
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

@app.route('/api/logs/groups')
def get_log_groups():
    try:
        monitor = AWSMonitor()
        groups = monitor.get_log_groups()
        return jsonify(groups)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logs/events')
def get_log_events():
    try:
        group_name = request.args.get('group')
        start_time = request.args.get('start_time')
        filter_pattern = request.args.get('filter')
        
        if not group_name:
            return jsonify({'error': 'Log group name is required'}), 400
            
        monitor = AWSMonitor()
        events = monitor.get_log_events(
            group_name,
            int(start_time) if start_time else None,
            filter_pattern
        )
        return jsonify(events)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/website-monitoring')
def get_website_status():
    try:
        websites = [
            'your-website1.com',
            'your-website2.com'
            # Add your websites here
        ]
        
        monitor = AWSMonitor()
        results = [monitor.monitor_website(url) for url in websites]
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cpu-utilization')
def get_cpu_metrics():
    try:
        monitor = AWSMonitor()
        metrics = monitor.get_cpu_utilization()
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/metrics/all')
def get_all_metrics():
    try:
        monitor = AWSMonitor()
        metrics = {
            'cpu': monitor.get_cpu_utilization(),
            'memory': monitor.get_memory_utilization(),
            'network': monitor.get_network_metrics(),
            'disk': monitor.get_disk_metrics()
        }
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cloud-metrics')
def get_cloud_metrics():
    try:
        monitor = AWSMonitor()
        metrics = monitor.get_cloud_metrics()
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/db-metrics')
def get_db_metrics():
    try:
        monitor = AWSMonitor()
        metrics = monitor.get_db_latency_metrics()
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/disk-metrics')
def get_disk_metrics():
    try:
        monitor = AWSMonitor()
        metrics = monitor.get_disk_metrics()
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/instances')
def get_instances():
    try:
        monitor = AWSMonitor()
        return jsonify(monitor.get_ec2_status())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rds-instances')
def get_rds_instances():
    try:
        monitor = AWSMonitor()
        return jsonify(monitor.get_rds_status())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/apm-metrics')
def get_apm_metrics():
    try:
        # Implement basic APM metrics
        monitor = AWSMonitor()
        metrics = {
            'response_time': monitor.get_cloud_metrics().get('compute', {}),
            'error_rate': 0,  # Add your error rate calculation
            'throughput': monitor.get_network_metrics().get('NetworkIn', []),
            'timestamp': datetime.utcnow().isoformat()
        }
        return jsonify(metrics)
    except Exception as e:
        logger.error(f"APM Metrics Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/rum-metrics')
def get_rum_metrics():
    try:
        # Implement basic RUM metrics
        metrics = {
            'page_load_time': [],  # Add your page load time metrics
            'user_interactions': [],  # Add user interaction metrics
            'client_errors': [],  # Add client-side error metrics
            'timestamp': datetime.utcnow().isoformat()
        }
        return jsonify(metrics)
    except Exception as e:
        logger.error(f"RUM Metrics Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/network-metrics')
def get_network_metrics():
    try:
        logger.info("Fetching network metrics...")
        monitor = AWSMonitor()
        metrics = monitor.get_network_metrics()
        logger.info(f"Network metrics retrieved: {metrics}")
        return jsonify(metrics)
    except Exception as e:
        logger.error(f"Error fetching network metrics: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/website-performance')
def get_website_performance_endpoint():
    try:
        monitor = AWSMonitor()
        metrics = monitor.get_website_performance()
        return jsonify(metrics)
    except Exception as e:
        logger.error(f"Error in website performance endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/webpage-speed-test', methods=['POST'])
def webpage_speed_test():
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400

        monitor = AWSMonitor()
        result = monitor.test_webpage_speed(url)
        
        if 'error' in result:
            return jsonify(result), 400
            
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in webpage speed test endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/server-metrics')
def get_server_metrics():
    try:
        monitor = AWSMonitor()
        metrics = monitor.get_server_metrics()
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/response-time-metrics')
def get_response_time_metrics():
    try:
        monitor = AWSMonitor()
        metrics = monitor.get_response_time_metrics()
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Check AWS credentials
    required_env_vars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_DEFAULT_REGION']
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {missing_vars}")
        exit(1)
    
    logger.info("Starting AWS Monitor API on port 5001")
    app.run(debug=True, host='0.0.0.0', port=5001)