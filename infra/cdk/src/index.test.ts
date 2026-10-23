import { describe, it, expect } from "vitest";
import { createTendCdkStackDefinition } from "./index.js";

describe("Tend CDK Infra Stack Definition", () => {
  it("defines production AWS CDK infrastructure matching requirements", () => {
    const stack = createTendCdkStackDefinition();

    expect(stack.stackName).toBe("TendProductionStack");
    expect(stack.dynamoDb.tableName).toBe("tend-main-table");
    expect(stack.dynamoDb.kmsEncryption).toBe(true);
    expect(stack.dynamoDb.pointInTimeRecovery).toBe(true);
    expect(stack.fargate.albHealthCheckPath).toBe("/health");
    expect(stack.asyncIntelligence.bedrockModelId).toContain("nova-micro");
    expect(stack.alerting.cloudWatchAlarms.p95LatencyThresholdMs).toBe(250);
  });
});
