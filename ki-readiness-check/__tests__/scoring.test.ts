import {
  calcDimensionScore,
  calcWeightedTotal,
  getAmpel,
  getOverallAssessment,
  DIMENSIONS,
  TOTAL_WEIGHT,
  TOTAL_QUESTIONS,
  PERSONAS,
  SCALE_OPTIONS,
  type Dimension,
  type PersonaId,
} from "@/lib/scoring";

describe("DIMENSIONS configuration", () => {
  it("has 6 dimensions", () => {
    expect(DIMENSIONS).toHaveLength(6);
  });

  it("each dimension has exactly 4 questions", () => {
    DIMENSIONS.forEach((dim) => {
      expect(dim.questions).toHaveLength(4);
    });
  });

  it("TOTAL_QUESTIONS equals 24", () => {
    expect(TOTAL_QUESTIONS).toBe(24);
  });

  it("TOTAL_WEIGHT equals sum of dimension weights (6.6)", () => {
    expect(TOTAL_WEIGHT).toBeCloseTo(6.6);
  });

  it("has correct killer dimensions", () => {
    const killers = DIMENSIONS.filter((d) => d.isKiller);
    expect(killers).toHaveLength(2);
    expect(killers[0].id).toBe("strategie");
    expect(killers[1].id).toBe("prozesse");
  });

  it("strategie has override killer effect with threshold 2.0", () => {
    const strategie = DIMENSIONS.find((d) => d.id === "strategie")!;
    expect(strategie.killerEffect).toBe("override");
    expect(strategie.killerThreshold).toBe(2.0);
    expect(strategie.weight).toBe(1.5);
  });

  it("prozesse has downgrade killer effect with threshold 2.0", () => {
    const prozesse = DIMENSIONS.find((d) => d.id === "prozesse")!;
    expect(prozesse.killerEffect).toBe("downgrade");
    expect(prozesse.killerThreshold).toBe(2.0);
    expect(prozesse.weight).toBe(1.3);
  });

  it("all question IDs are unique", () => {
    const ids = DIMENSIONS.flatMap((d) => d.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each question has text for all 3 personas", () => {
    DIMENSIONS.forEach((dim) => {
      dim.questions.forEach((q) => {
        expect(q.text.solo).toBeTruthy();
        expect(q.text.kmu).toBeTruthy();
        expect(q.text.bereich).toBeTruthy();
      });
    });
  });
});

describe("PERSONAS configuration", () => {
  it("has 3 personas", () => {
    expect(PERSONAS).toHaveLength(3);
  });

  it("solo persona routes to zweimeter.online", () => {
    const solo = PERSONAS.find((p) => p.id === "solo")!;
    expect(solo.funnel).toBe("zweimeter.online");
  });

  it("kmu and bereich personas route to ZweiMeter.Consulting", () => {
    const kmu = PERSONAS.find((p) => p.id === "kmu")!;
    const bereich = PERSONAS.find((p) => p.id === "bereich")!;
    expect(kmu.funnel).toBe("ZweiMeter.Consulting");
    expect(bereich.funnel).toBe("ZweiMeter.Consulting");
  });
});

describe("SCALE_OPTIONS", () => {
  it("has 4 options from 1 to 4", () => {
    expect(SCALE_OPTIONS).toHaveLength(4);
    expect(SCALE_OPTIONS[0].value).toBe(1);
    expect(SCALE_OPTIONS[3].value).toBe(4);
  });
});

describe("calcDimensionScore", () => {
  const strategie = DIMENSIONS[0];

  it("returns 0 when no answers are provided", () => {
    expect(calcDimensionScore({}, strategie)).toBe(0);
  });

  it("returns correct average for partial answers", () => {
    const answers = { "F1.1": 3, "F1.2": 4 };
    expect(calcDimensionScore(answers, strategie)).toBe(3.5);
  });

  it("returns correct average for all answers", () => {
    const answers = { "F1.1": 1, "F1.2": 2, "F1.3": 3, "F1.4": 4 };
    expect(calcDimensionScore(answers, strategie)).toBe(2.5);
  });

  it("returns perfect score when all answers are 4", () => {
    const answers = { "F1.1": 4, "F1.2": 4, "F1.3": 4, "F1.4": 4 };
    expect(calcDimensionScore(answers, strategie)).toBe(4.0);
  });

  it("returns minimum score when all answers are 1", () => {
    const answers = { "F1.1": 1, "F1.2": 1, "F1.3": 1, "F1.4": 1 };
    expect(calcDimensionScore(answers, strategie)).toBe(1.0);
  });

  it("ignores answers for questions not in the dimension", () => {
    const answers = { "F1.1": 4, "F1.2": 4, "F1.3": 4, "F1.4": 4, "F2.1": 1 };
    expect(calcDimensionScore(answers, strategie)).toBe(4.0);
  });

  it("works for different dimensions", () => {
    const prozesse = DIMENSIONS[1];
    const answers = { "F2.1": 2, "F2.2": 3, "F2.3": 2, "F2.4": 3 };
    expect(calcDimensionScore(answers, prozesse)).toBe(2.5);
  });
});

describe("calcWeightedTotal", () => {
  it("returns 0 when all scores are 0", () => {
    const dimScores: Record<string, number> = {};
    DIMENSIONS.forEach((d) => { dimScores[d.id] = 0; });
    expect(calcWeightedTotal(dimScores)).toBe(0);
  });

  it("returns 4 when all scores are 4", () => {
    const dimScores: Record<string, number> = {};
    DIMENSIONS.forEach((d) => { dimScores[d.id] = 4; });
    expect(calcWeightedTotal(dimScores)).toBeCloseTo(4.0);
  });

  it("applies weights correctly", () => {
    const dimScores: Record<string, number> = {
      strategie: 3.0,
      prozesse: 3.0,
      daten: 3.0,
      technik: 3.0,
      menschen: 3.0,
      regulatorik: 3.0,
    };
    expect(calcWeightedTotal(dimScores)).toBeCloseTo(3.0);
  });

  it("strategie contributes more due to higher weight", () => {
    const baseScores: Record<string, number> = {
      strategie: 2.0,
      prozesse: 2.0,
      daten: 2.0,
      technik: 2.0,
      menschen: 2.0,
      regulatorik: 2.0,
    };

    const highStrategie = { ...baseScores, strategie: 4.0 };
    const highRegulatorik = { ...baseScores, regulatorik: 4.0 };

    const diffStrategie = calcWeightedTotal(highStrategie) - calcWeightedTotal(baseScores);
    const diffRegulatorik = calcWeightedTotal(highRegulatorik) - calcWeightedTotal(baseScores);

    expect(diffStrategie).toBeGreaterThan(diffRegulatorik);
  });

  it("returns correct weighted formula result", () => {
    const dimScores: Record<string, number> = {
      strategie: 4.0,
      prozesse: 3.0,
      daten: 2.0,
      technik: 2.0,
      menschen: 2.0,
      regulatorik: 1.0,
    };
    const expected = (4.0 * 1.5 + 3.0 * 1.3 + 2.0 * 1.0 + 2.0 * 1.0 + 2.0 * 1.0 + 1.0 * 0.8) / 6.6;
    expect(calcWeightedTotal(dimScores)).toBeCloseTo(expected);
  });
});

describe("getAmpel", () => {
  it("returns red for scores below 2.0", () => {
    expect(getAmpel(0)).toEqual({ color: "#E74C3C", label: "Rot", text: "Erheblicher Handlungsbedarf" });
    expect(getAmpel(1.0)).toEqual({ color: "#E74C3C", label: "Rot", text: "Erheblicher Handlungsbedarf" });
    expect(getAmpel(1.99)).toEqual({ color: "#E74C3C", label: "Rot", text: "Erheblicher Handlungsbedarf" });
  });

  it("returns yellow for scores from 2.0 to below 3.0", () => {
    expect(getAmpel(2.0)).toEqual({ color: "#F39C12", label: "Gelb", text: "Gezielte Maßnahmen empfohlen" });
    expect(getAmpel(2.5)).toEqual({ color: "#F39C12", label: "Gelb", text: "Gezielte Maßnahmen empfohlen" });
    expect(getAmpel(2.99)).toEqual({ color: "#F39C12", label: "Gelb", text: "Gezielte Maßnahmen empfohlen" });
  });

  it("returns green for scores 3.0 and above", () => {
    expect(getAmpel(3.0)).toEqual({ color: "#27AE60", label: "Grün", text: "Gute Voraussetzungen" });
    expect(getAmpel(3.5)).toEqual({ color: "#27AE60", label: "Grün", text: "Gute Voraussetzungen" });
    expect(getAmpel(4.0)).toEqual({ color: "#27AE60", label: "Grün", text: "Gute Voraussetzungen" });
  });

  it("boundary at exactly 2.0 is yellow", () => {
    const result = getAmpel(2.0);
    expect(result.label).toBe("Gelb");
  });

  it("boundary at exactly 3.0 is green", () => {
    const result = getAmpel(3.0);
    expect(result.label).toBe("Grün");
  });
});

describe("getOverallAssessment", () => {
  describe("killer dimension: strategie", () => {
    it("triggers killer override when strategie < 2.0 (solo)", () => {
      const dimScores = {
        strategie: 1.5, prozesse: 3.0, daten: 3.0,
        technik: 3.0, menschen: 3.0, regulatorik: 3.0,
      };
      const result = getOverallAssessment(3.0, dimScores, "solo");
      expect(result.level).toBe(1);
      expect(result.title).toBe("Nicht bereit");
      expect(result.killerTriggered).toBe("strategie");
      expect(result.ctaProduct).toBe("zweimeter.online");
    });

    it("triggers killer override when strategie < 2.0 (kmu)", () => {
      const dimScores = {
        strategie: 1.0, prozesse: 4.0, daten: 4.0,
        technik: 4.0, menschen: 4.0, regulatorik: 4.0,
      };
      const result = getOverallAssessment(3.5, dimScores, "kmu");
      expect(result.level).toBe(1);
      expect(result.title).toBe("Nicht bereit");
      expect(result.killerTriggered).toBe("strategie");
      expect(result.ctaProduct).toBe("ZweiMeter.Consulting");
    });

    it("does not trigger when strategie >= 2.0", () => {
      const dimScores = {
        strategie: 2.0, prozesse: 3.0, daten: 3.0,
        technik: 3.0, menschen: 3.0, regulatorik: 3.0,
      };
      const result = getOverallAssessment(3.0, dimScores, "kmu");
      expect(result.killerTriggered).not.toBe("strategie");
    });
  });

  describe("killer dimension: prozesse (downgrade)", () => {
    it("downgrades to level 1 when prozesse < 2.0 and effective score was high", () => {
      const dimScores = {
        strategie: 4.0, prozesse: 1.5, daten: 4.0,
        technik: 4.0, menschen: 4.0, regulatorik: 4.0,
      };
      const result = getOverallAssessment(3.8, dimScores, "kmu");
      expect(result.level).toBe(1);
      expect(result.title).toBe("Nicht bereit");
      expect(result.killerTriggered).toBe("prozesse");
    });

    it("downgrades effective score to max 1.99 when prozesse < 2.0", () => {
      const dimScores = {
        strategie: 4.0, prozesse: 1.0, daten: 4.0,
        technik: 4.0, menschen: 4.0, regulatorik: 4.0,
      };
      const result = getOverallAssessment(3.5, dimScores, "solo");
      expect(result.level).toBe(1);
      expect(result.killerTriggered).toBe("prozesse");
      expect(result.text).toContain("Arbeitsabläufe");
    });
  });

  describe("level assessment without killer triggers", () => {
    it("returns level 1 when weighted score < 2.0 (no killer)", () => {
      const dimScores = {
        strategie: 2.0, prozesse: 2.0, daten: 1.0,
        technik: 1.0, menschen: 1.0, regulatorik: 1.0,
      };
      const result = getOverallAssessment(1.5, dimScores, "kmu");
      expect(result.level).toBe(1);
      expect(result.title).toBe("Nicht bereit");
      expect(result.killerTriggered).toBeNull();
    });

    it("returns level 2 (Bedingt bereit) for score 2.0 - 2.49", () => {
      const dimScores = {
        strategie: 2.5, prozesse: 2.5, daten: 2.0,
        technik: 2.0, menschen: 2.0, regulatorik: 2.0,
      };
      const result = getOverallAssessment(2.2, dimScores, "kmu");
      expect(result.level).toBe(2);
      expect(result.title).toBe("Bedingt bereit");
    });

    it("returns level 3 (Weitgehend bereit) for score 2.5 - 2.99", () => {
      const dimScores = {
        strategie: 3.0, prozesse: 3.0, daten: 3.0,
        technik: 2.5, menschen: 2.5, regulatorik: 2.5,
      };
      const result = getOverallAssessment(2.7, dimScores, "solo");
      expect(result.level).toBe(3);
      expect(result.title).toBe("Weitgehend bereit");
    });

    it("returns level 4 (Bereit) for score >= 3.0", () => {
      const dimScores = {
        strategie: 4.0, prozesse: 4.0, daten: 3.0,
        technik: 3.0, menschen: 3.0, regulatorik: 3.0,
      };
      const result = getOverallAssessment(3.5, dimScores, "bereich");
      expect(result.level).toBe(4);
      expect(result.title).toBe("Bereit");
    });
  });

  describe("persona-dependent CTA product", () => {
    it("solo gets zweimeter.online", () => {
      const dimScores = {
        strategie: 4.0, prozesse: 4.0, daten: 4.0,
        technik: 4.0, menschen: 4.0, regulatorik: 4.0,
      };
      const result = getOverallAssessment(4.0, dimScores, "solo");
      expect(result.ctaProduct).toBe("zweimeter.online");
    });

    it("kmu gets ZweiMeter.Consulting", () => {
      const dimScores = {
        strategie: 4.0, prozesse: 4.0, daten: 4.0,
        technik: 4.0, menschen: 4.0, regulatorik: 4.0,
      };
      const result = getOverallAssessment(4.0, dimScores, "kmu");
      expect(result.ctaProduct).toBe("ZweiMeter.Consulting");
    });

    it("bereich gets ZweiMeter.Consulting", () => {
      const dimScores = {
        strategie: 4.0, prozesse: 4.0, daten: 4.0,
        technik: 4.0, menschen: 4.0, regulatorik: 4.0,
      };
      const result = getOverallAssessment(4.0, dimScores, "bereich");
      expect(result.ctaProduct).toBe("ZweiMeter.Consulting");
    });

    it("null persona defaults to non-solo (ZweiMeter.Consulting)", () => {
      const dimScores = {
        strategie: 4.0, prozesse: 4.0, daten: 4.0,
        technik: 4.0, menschen: 4.0, regulatorik: 4.0,
      };
      const result = getOverallAssessment(4.0, dimScores, null);
      expect(result.ctaProduct).toBe("ZweiMeter.Consulting");
    });
  });

  describe("persona-dependent recommendations", () => {
    it("solo recommendations use personal language", () => {
      const dimScores = {
        strategie: 4.0, prozesse: 4.0, daten: 4.0,
        technik: 4.0, menschen: 4.0, regulatorik: 4.0,
      };
      const result = getOverallAssessment(4.0, dimScores, "solo");
      expect(result.recommendation).toContain("Legen Sie los");
    });

    it("kmu recommendations use organizational language", () => {
      const dimScores = {
        strategie: 4.0, prozesse: 4.0, daten: 4.0,
        technik: 4.0, menschen: 4.0, regulatorik: 4.0,
      };
      const result = getOverallAssessment(4.0, dimScores, "kmu");
      expect(result.recommendation).toContain("KI-Strategieberatung");
    });
  });

  describe("edge cases", () => {
    it("strategie exactly at 2.0 does not trigger killer", () => {
      const dimScores = {
        strategie: 2.0, prozesse: 3.0, daten: 3.0,
        technik: 3.0, menschen: 3.0, regulatorik: 3.0,
      };
      const result = getOverallAssessment(3.0, dimScores, "kmu");
      expect(result.killerTriggered).not.toBe("strategie");
    });

    it("prozesse exactly at 2.0 does not trigger downgrade", () => {
      const dimScores = {
        strategie: 3.0, prozesse: 2.0, daten: 3.0,
        technik: 3.0, menschen: 3.0, regulatorik: 3.0,
      };
      const result = getOverallAssessment(3.0, dimScores, "kmu");
      expect(result.killerTriggered).not.toBe("prozesse");
    });

    it("both killers triggered: strategie takes precedence", () => {
      const dimScores = {
        strategie: 1.0, prozesse: 1.0, daten: 1.0,
        technik: 1.0, menschen: 1.0, regulatorik: 1.0,
      };
      const result = getOverallAssessment(1.0, dimScores, "kmu");
      expect(result.killerTriggered).toBe("strategie");
    });
  });
});
