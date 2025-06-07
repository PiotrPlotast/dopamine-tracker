import { classifyDopamineActivity } from "./dopamine";
import { describe, it, expect } from "vitest";

describe("getDopamineState", () => {
  it("returns low for low values", () => {
    const sessionLow = {
      domain: "udemy.com",
      duration: 300, // 5 minutes
      scrolls: 5,
      clicks: 2,
    };
    console.log("Testing low session:", sessionLow);
    const result = classifyDopamineActivity(sessionLow as any);
    console.log("Result:", result);
    expect(result).toBe("low");
  });

  it("returns medium for mid-range", () => {
    const sessionMedium = {
      domain: "instagram.com",
      duration: 1200, // 20 minutes
      scrolls: 500,
      clicks: 10,
    };
    console.log("Testing medium session:", sessionMedium);
    const result = classifyDopamineActivity(sessionMedium as any);
    console.log("Result:", result);
    expect(result).toBe("medium");
  });

  it("returns high for high values", () => {
    const sessionHigh = {
      domain: "roblox.com",
      duration: 900, // 15 minutes
      scrolls: 1200,
      clicks: 100,
    };
    console.log("Testing high session:", sessionHigh);
    const result = classifyDopamineActivity(sessionHigh as any);
    console.log("Result:", result);
    expect(result).toBe("high");
  });
});
