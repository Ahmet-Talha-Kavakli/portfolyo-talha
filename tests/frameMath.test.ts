import { describe, it, expect } from "vitest";
import { progressToFrame, markerAt } from "@/lib/frameMath";
import { HOME_MARKERS, type Marker } from "@/lib/markers";

describe("progressToFrame", () => {
  it("maps 0 -> first frame, 1 -> last frame", () => {
    expect(progressToFrame(0, 240)).toBe(0);
    expect(progressToFrame(1, 240)).toBe(239);
  });

  it("maps the midpoint to a middle frame", () => {
    expect(progressToFrame(0.5, 241)).toBe(120);
  });

  it("clamps out-of-range progress", () => {
    expect(progressToFrame(-0.5, 100)).toBe(0);
    expect(progressToFrame(2, 100)).toBe(99);
  });

  it("is safe for degenerate frame counts", () => {
    expect(progressToFrame(0.5, 1)).toBe(0);
    expect(progressToFrame(0.5, 0)).toBe(0);
  });

  it("returns an integer", () => {
    expect(Number.isInteger(progressToFrame(0.3737, 240))).toBe(true);
  });
});

describe("markerAt", () => {
  const markers: Marker[] = [
    { name: "a", at: 0 },
    { name: "b", at: 0.33 },
    { name: "c", at: 0.8 },
  ];

  it("returns the active (last passed) marker name", () => {
    expect(markerAt(0, markers)).toBe("a");
    expect(markerAt(0.2, markers)).toBe("a");
    expect(markerAt(0.33, markers)).toBe("b");
    expect(markerAt(0.5, markers)).toBe("b");
    expect(markerAt(0.95, markers)).toBe("c");
  });

  it("clamps below the first marker to the first marker", () => {
    expect(markerAt(-1, markers)).toBe("a");
  });

  it("works with the real HOME_MARKERS (6 scenes, ascending, starts at 0)", () => {
    expect(HOME_MARKERS.length).toBe(6);
    expect(HOME_MARKERS[0].at).toBe(0);
    for (let i = 1; i < HOME_MARKERS.length; i++) {
      expect(HOME_MARKERS[i].at).toBeGreaterThan(HOME_MARKERS[i - 1].at);
    }
    expect(markerAt(0, HOME_MARKERS)).toBe(HOME_MARKERS[0].name);
    expect(markerAt(1, HOME_MARKERS)).toBe(
      HOME_MARKERS[HOME_MARKERS.length - 1].name,
    );
  });
});
