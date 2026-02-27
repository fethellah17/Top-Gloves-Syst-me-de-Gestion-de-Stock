import { describe, it, expect } from "vitest";
import { calculateAutonomy, getStockStatus } from "./stock-utils";

describe("Stock Utils", () => {
  describe("calculateAutonomy", () => {
    it("should calculate autonomy in days and hours", () => {
      const result = calculateAutonomy(2500, 50);
      expect(result.days).toBe(50);
      expect(result.hours).toBe(0);
      expect(result.label).toBe("50j");
    });

    it("should calculate autonomy with hours", () => {
      const result = calculateAutonomy(1200, 50);
      expect(result.days).toBe(24);
      expect(result.hours).toBe(0);
      expect(result.label).toBe("24j");
    });

    it("should handle autonomy less than 1 day", () => {
      const result = calculateAutonomy(100, 50);
      expect(result.days).toBe(0);
      expect(result.hours).toBe(48);
      expect(result.label).toBe("48h");
    });

    it("should mark as low when autonomy <= 3 days", () => {
      const result = calculateAutonomy(45, 15);
      expect(result.isLow).toBe(true);
      expect(result.label).toBe("3j");
    });

    it("should handle zero consumption", () => {
      const result = calculateAutonomy(1000, 0);
      expect(result.label).toBe("N/A");
      expect(result.isLow).toBe(false);
    });
  });

  describe("getStockStatus", () => {
    it("should return CRITICAL when stock <= seuil", () => {
      const status = getStockStatus(100, 500, 50);
      expect(status.level).toBe("critical");
      expect(status.label).toBe("CRITIQUE");
    });

    it("should return CRITICAL when autonomy <= 3 days", () => {
      const status = getStockStatus(2000, 500, 200);
      expect(status.level).toBe("critical");
      expect(status.label).toBe("CRITIQUE");
    });

    it("should return WARNING when autonomy between 4-7 days", () => {
      const status = getStockStatus(2500, 500, 50);
      expect(status.level).toBe("warning");
      expect(status.label).toBe("ATTENTION");
    });

    it("should return SECURE when stock > seuil and autonomy > 7 days", () => {
      const status = getStockStatus(5000, 500, 50);
      expect(status.level).toBe("secure");
      expect(status.label).toBe("SÉCURISÉ");
    });

    it("should have correct colors for each status", () => {
      const critical = getStockStatus(100, 500, 50);
      expect(critical.bgColor).toContain("red");

      const warning = getStockStatus(2500, 500, 50);
      expect(warning.bgColor).toContain("orange");

      const secure = getStockStatus(5000, 500, 50);
      expect(secure.bgColor).toContain("green");
    });
  });
});
