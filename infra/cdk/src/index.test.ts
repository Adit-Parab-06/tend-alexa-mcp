import { describe, it, expect } from "vitest";
import { getDefaultInfraConfig } from "./index.js";

describe("Tend CDK Infra Foundation", () => {
  it("generates default infrastructure configuration", () => {
    const config = getDefaultInfraConfig();
    expect(config.stackName).toBe("TendStack");
    expect(config.dynamoTableName).toBe("tend-main-table");
    expect(config.version).toBe("0.1.0");
  });
});
