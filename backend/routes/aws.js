const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1'
});

const ec2 = new AWS.EC2();
const rds = new AWS.RDS();
const cloudwatch = new AWS.CloudWatch();

// Get EC2 Instances
router.get('/instances', async (req, res) => {
    try {
        const data = await ec2.describeInstances().promise();
        const instances = data.Reservations.flatMap(reservation => 
            reservation.Instances.map(instance => ({
                id: instance.InstanceId,
                type: instance.InstanceType,
                state: instance.State.Name,
                publicDns: instance.PublicDnsName,
                launchTime: instance.LaunchTime
            }))
        );
        res.json(instances);
    } catch (error) {
        console.error('EC2 Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get RDS Instances
router.get('/rds-instances', async (req, res) => {
    try {
        const data = await rds.describeDBInstances().promise();
        const instances = data.DBInstances.map(instance => ({
            id: instance.DBInstanceIdentifier,
            class: instance.DBInstanceClass,
            engine: instance.Engine,
            status: instance.DBInstanceStatus
        }));
        res.json(instances);
    } catch (error) {
        console.error('RDS Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get APM Metrics
router.get('/apm-metrics', async (req, res) => {
    try {
        const endTime = new Date();
        const startTime = new Date(endTime - 3600000); // Last hour

        const metrics = await cloudwatch.getMetricData({
            StartTime: startTime,
            EndTime: endTime,
            MetricDataQueries: [
                {
                    Id: 'cpu',
                    MetricStat: {
                        Metric: {
                            Namespace: 'AWS/EC2',
                            MetricName: 'CPUUtilization'
                        },
                        Period: 300,
                        Stat: 'Average'
                    }
                }
            ]
        }).promise();

        res.json(metrics);
    } catch (error) {
        console.error('APM Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get RUM Metrics
router.get('/rum-metrics', async (req, res) => {
    try {
        // Implement RUM metrics logic here
        res.json({
            pageLoadTime: Math.random() * 1000,
            userSessions: Math.floor(Math.random() * 100),
            errorRate: Math.random() * 5
        });
    } catch (error) {
        console.error('RUM Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 