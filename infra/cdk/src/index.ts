import { TEND_VERSION } from "@tend/core";

export interface InfrastructureConfig {
  stackName: string;
  region: string;
  fargateCpu: number;
  fargateMemoryLimitMiB: number;
  dynamoTableName: string;
  version: string;
}

export function getDefaultInfraConfig(): InfrastructureConfig {
  return {
    stackName: "TendStack",
    region: process.env.AWS_REGION || "us-east-1",
    fargateCpu: 256,
    fargateMemoryLimitMiB: 512,
    dynamoTableName: "tend-main-table",
    version: TEND_VERSION,
  };
}
