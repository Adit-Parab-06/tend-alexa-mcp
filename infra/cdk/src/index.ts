import { TEND_VERSION } from "@tend/core";

export interface AwsBuilderServiceUsage {
  service: string;
  role: string;
  configuration: Record<string, unknown>;
}

export interface TendInfrastructureStack {
  stackName: string;
  region: string;
  vpc: {
    cidr: string;
    maxAzs: number;
    natGateways: number;
  };
  dynamoDb: {
    tableName: string;
    billingMode: "PAY_PER_REQUEST";
    pointInTimeRecovery: boolean;
    kmsEncryption: boolean;
    partitionKey: string;
    sortKey: string;
    gsi1: { name: string; partitionKey: string; sortKey: string };
  };
  fargate: {
    cpu: number;
    memoryLimitMiB: number;
    desiredCount: number;
    containerPort: number;
    albHealthCheckPath: string;
  };
  asyncIntelligence: {
    scheduler: string; // EventBridge daily cron
    digestWorkerLambda: string;
    bedrockModelId: string; // Amazon Nova Micro / Converse API
    outputInsightTableKey: string;
  };
  alerting: {
    snsTopicName: string;
    cloudWatchAlarms: {
      p95LatencyThresholdMs: number;
      http5xxThreshold: number;
      authFailureThreshold: number;
    };
  };
  version: string;
}

/**
 * Returns complete AWS CDK Stack definition for Tend
 */
export function createTendCdkStackDefinition(): TendInfrastructureStack {
  return {
    stackName: "TendProductionStack",
    region: process.env.AWS_REGION || "us-east-1",
    vpc: {
      cidr: "10.0.0.0/16",
      maxAzs: 2,
      natGateways: 1,
    },
    dynamoDb: {
      tableName: process.env.DYNAMODB_TABLE_NAME || "tend-main-table",
      billingMode: "PAY_PER_REQUEST",
      pointInTimeRecovery: true,
      kmsEncryption: true,
      partitionKey: "PK",
      sortKey: "SK",
      gsi1: {
        name: "GSI1",
        partitionKey: "GSI1PK",
        sortKey: "GSI1SK",
      },
    },
    fargate: {
      cpu: 512,
      memoryLimitMiB: 1024,
      desiredCount: 2,
      containerPort: 3000,
      albHealthCheckPath: "/health",
    },
    asyncIntelligence: {
      scheduler: "cron(0 6 * * ? *)", // Run at 06:00 AM daily
      digestWorkerLambda: "TendBedrockDigestWorker",
      bedrockModelId: process.env.BEDROCK_MODEL_ID || "amazon.nova-micro-v1:0",
      outputInsightTableKey: "INSIGHT#LATEST",
    },
    alerting: {
      snsTopicName: "tend-circle-escalations",
      cloudWatchAlarms: {
        p95LatencyThresholdMs: 250, // Hard Alexa+ SLA target
        http5xxThreshold: 5,
        authFailureThreshold: 10,
      },
    },
    version: TEND_VERSION,
  };
}
