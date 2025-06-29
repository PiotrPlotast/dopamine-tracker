import { describe, it, expect, beforeEach } from "vitest";
import { SessionTracker } from "./sessionTracker";

describe("SessionTracker", () => {
  let tracker: SessionTracker;

  beforeEach(() => {
    tracker = new SessionTracker("https://example.com");
  });

  it("initializes correctly", () => {
    expect(tracker.clickCount).toBe(0);
    expect(tracker.maxScrollPercent).toBe(0);
    expect(tracker.url).toBe("https://example.com");
  });

  it("counts clicks", () => {
    tracker.recordClick();
    tracker.recordClick();
    expect(tracker.clickCount).toBe(2);
  });

  it("records maximum scroll percent", () => {
    tracker.recordScroll(0, 600, 1200); // 50%
    tracker.recordScroll(400, 600, 1200); // 83.3%
    tracker.recordScroll(0, 600, 1200); // 50% again → should NOT decrease

    expect(tracker.maxScrollPercent).toBeCloseTo(100, 1);
  });

  it("returns correct activity data", () => {
    tracker.clickCount = 3;
    tracker.maxScrollPercent = 65;
    tracker.sessionStart -= 5000; // simulate 5s session

    const activity = tracker.getActivity();

    expect(activity.url).toBe("https://example.com");
    expect(activity.duration).toBeGreaterThanOrEqual(5);
    expect(activity.clicks).toBe(3);
    expect(activity.scrolls).toBe(65);
    expect(typeof activity.hour_of_day).toBe("number");
    expect(activity.date).toBeInstanceOf(Date);
    expect(activity.timestamp).toBeInstanceOf(Date);
  });
});
