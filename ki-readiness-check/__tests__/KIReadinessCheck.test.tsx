import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import KIReadinessCheck from "@/components/KIReadinessCheck";

jest.useFakeTimers();

describe("KIReadinessCheck Component", () => {
  describe("Intro Phase", () => {
    it("renders the intro screen with title and start button", () => {
      render(<KIReadinessCheck />);
      expect(screen.getByText("KI-Readiness-Check")).toBeInTheDocument();
      expect(screen.getByText("Check starten")).toBeInTheDocument();
    });

    it("shows dimension labels on intro screen", () => {
      render(<KIReadinessCheck />);
      expect(screen.getByText("Strategie")).toBeInTheDocument();
      expect(screen.getByText("Prozesse")).toBeInTheDocument();
      expect(screen.getByText("Daten")).toBeInTheDocument();
      expect(screen.getByText("Technik")).toBeInTheDocument();
      expect(screen.getByText("Menschen")).toBeInTheDocument();
      expect(screen.getByText("Regulatorik")).toBeInTheDocument();
    });

    it("transitions to persona selection on button click", () => {
      render(<KIReadinessCheck />);
      fireEvent.click(screen.getByText("Check starten"));
      expect(screen.getByText("In welcher Rolle wollen Sie den Check nutzen?")).toBeInTheDocument();
    });
  });

  describe("Persona Selection Phase", () => {
    it("shows all 3 persona options", () => {
      render(<KIReadinessCheck />);
      fireEvent.click(screen.getByText("Check starten"));

      expect(screen.getByText("Einzelunternehmer / Freiberufler")).toBeInTheDocument();
      expect(screen.getByText("Unternehmen (bis 250 Mitarbeitende)")).toBeInTheDocument();
      expect(screen.getByText("Bereich / Abteilung")).toBeInTheDocument();
    });

    it("has a back button to return to intro", () => {
      render(<KIReadinessCheck />);
      fireEvent.click(screen.getByText("Check starten"));

      fireEvent.click(screen.getByText("\u2190 Zurück"));
      expect(screen.getByText("Check starten")).toBeInTheDocument();
    });

    it("transitions to quiz on persona selection", () => {
      render(<KIReadinessCheck />);
      fireEvent.click(screen.getByText("Check starten"));
      fireEvent.click(screen.getByText("Einzelunternehmer / Freiberufler"));

      expect(screen.getByText("Strategische Klarheit und Zielreife")).toBeInTheDocument();
    });
  });

  describe("Quiz Phase", () => {
    function goToQuiz(persona: string = "Einzelunternehmer / Freiberufler") {
      render(<KIReadinessCheck />);
      fireEvent.click(screen.getByText("Check starten"));
      fireEvent.click(screen.getByText(persona));
    }

    it("shows first question of first dimension", () => {
      goToQuiz();
      expect(screen.getByText("Frage 1 von 24")).toBeInTheDocument();
      expect(screen.getByText(/Ich kann klar formulieren/)).toBeInTheDocument();
    });

    it("displays all 4 scale options", () => {
      goToQuiz();
      expect(screen.getByText("Trifft nicht zu")).toBeInTheDocument();
      expect(screen.getByText("Trifft eher nicht zu")).toBeInTheDocument();
      expect(screen.getByText("Trifft eher zu")).toBeInTheDocument();
      expect(screen.getByText("Trifft voll zu")).toBeInTheDocument();
    });

    it("shows progress counter", () => {
      goToQuiz();
      expect(screen.getByText("0 / 24")).toBeInTheDocument();
    });

    it("advances to next question after answering", () => {
      goToQuiz();
      fireEvent.click(screen.getByText("Trifft voll zu"));

      act(() => { jest.advanceTimersByTime(400); });

      expect(screen.getByText("Frage 2 von 24")).toBeInTheDocument();
    });

    it("advances to next dimension after completing all questions", () => {
      goToQuiz();

      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText("Trifft voll zu"));
        act(() => { jest.advanceTimersByTime(400); });
      }

      expect(screen.getByText("Prozessreife")).toBeInTheDocument();
    });

    it("shows different question text for KMU persona", () => {
      render(<KIReadinessCheck />);
      fireEvent.click(screen.getByText("Check starten"));
      fireEvent.click(screen.getByText("Unternehmen (bis 250 Mitarbeitende)"));

      expect(screen.getByText(/Wir können klar formulieren/)).toBeInTheDocument();
    });

    it("go back returns to previous question", () => {
      goToQuiz();

      fireEvent.click(screen.getByText("Trifft voll zu"));
      act(() => { jest.advanceTimersByTime(400); });

      expect(screen.getByText("Frage 2 von 24")).toBeInTheDocument();

      fireEvent.click(screen.getByText("\u2190 Vorherige Frage"));
      expect(screen.getByText("Frage 1 von 24")).toBeInTheDocument();
    });

    it("go back on first question returns to persona selection", () => {
      goToQuiz();
      fireEvent.click(screen.getByText("\u2190 Rollenauswahl ändern"));

      expect(screen.getByText("In welcher Rolle wollen Sie den Check nutzen?")).toBeInTheDocument();
    });

    it("transitions to result after answering all 24 questions", () => {
      goToQuiz();

      for (let i = 0; i < 24; i++) {
        fireEvent.click(screen.getByText("Trifft voll zu"));
        act(() => { jest.advanceTimersByTime(400); });
      }

      expect(screen.getByText("Ihr KI-Readiness-Ergebnis")).toBeInTheDocument();
    });
  });

  describe("Result Phase", () => {
    function completeQuizWithScore(value: number, persona: string = "Einzelunternehmer / Freiberufler") {
      render(<KIReadinessCheck />);
      fireEvent.click(screen.getByText("Check starten"));
      fireEvent.click(screen.getByText(persona));

      const labels = ["Trifft nicht zu", "Trifft eher nicht zu", "Trifft eher zu", "Trifft voll zu"];
      const label = labels[value - 1];

      for (let i = 0; i < 24; i++) {
        fireEvent.click(screen.getByText(label));
        act(() => { jest.advanceTimersByTime(400); });
      }
    }

    it("shows result page with score", () => {
      completeQuizWithScore(4);
      expect(screen.getByText("Ihr KI-Readiness-Ergebnis")).toBeInTheDocument();
      expect(screen.getByText("von 4.0 Punkten (gewichtet)")).toBeInTheDocument();
    });

    it("shows Bereit assessment for all-4 answers", () => {
      completeQuizWithScore(4);
      expect(screen.getByText("Bereit")).toBeInTheDocument();
    });

    it("shows Nicht bereit assessment for all-1 answers", () => {
      completeQuizWithScore(1);
      expect(screen.getByText("Nicht bereit")).toBeInTheDocument();
    });

    it("shows killer dimension warning for low strategy scores", () => {
      completeQuizWithScore(1);
      expect(screen.getByText(/Killer-Dimension ausgelöst/)).toBeInTheDocument();
    });

    it("shows persona info for solo", () => {
      completeQuizWithScore(4, "Einzelunternehmer / Freiberufler");
      expect(screen.getByText(/Einzelunternehmer/)).toBeInTheDocument();
    });

    it("shows correct CTA for solo persona", () => {
      completeQuizWithScore(4, "Einzelunternehmer / Freiberufler");
      expect(screen.getByText("Erstgespräch vereinbaren")).toBeInTheDocument();
    });

    it("shows correct CTA for KMU persona", () => {
      completeQuizWithScore(4, "Unternehmen (bis 250 Mitarbeitende)");
      expect(screen.getByText("Persönlichen Check anfragen")).toBeInTheDocument();
    });

    it("displays radar chart", () => {
      completeQuizWithScore(3);
      const svgElements = document.querySelectorAll("svg");
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it("shows dimension scores section", () => {
      completeQuizWithScore(3);
      expect(screen.getByText("Ergebnis nach Dimensionen")).toBeInTheDocument();
    });

    it("shows weight explanation section", () => {
      completeQuizWithScore(3);
      expect(screen.getByText("Wie Ihr Gesamtscore entsteht")).toBeInTheDocument();
    });
  });
});
