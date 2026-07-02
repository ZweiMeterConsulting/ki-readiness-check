import type { Dimension, PersonaConfig, ScaleOption } from "./types";

export const PERSONAS: PersonaConfig[] = [
  {
    id: "solo",
    label: "Einzelunternehmer / Freiberufler",
    description: "Ich nutze den Check für mich und mein eigenes Unternehmen.",
    icon: "solo",
    funnel: "zweimeter.online",
  },
  {
    id: "kmu",
    label: "Unternehmen (bis 250 Mitarbeitende)",
    description: "Ich prüfe die KI-Bereitschaft meines gesamten Unternehmens.",
    icon: "kmu",
    funnel: "ZweiMeter.Consulting",
  },
  {
    id: "bereich",
    label: "Bereich / Abteilung",
    description:
      "Ich prüfe die KI-Bereitschaft meines Bereichs in einem größeren Unternehmen.",
    icon: "bereich",
    funnel: "ZweiMeter.Consulting",
  },
];

export const DIMENSIONS: Dimension[] = [
  {
    id: "strategie",
    label: "Strategische Klarheit und Zielreife",
    shortLabel: "Strategie",
    weight: 1.5,
    isKiller: true,
    killerThreshold: 2.0,
    killerEffect: "override",
    color: "#1A3A5C",
    description: {
      solo: "Haben Sie eine klare Vorstellung davon, warum und wofür Sie KI einsetzen wollen?",
      kmu: "Hat Ihr Unternehmen eine klare Vorstellung davon, warum und wofür es KI einsetzen will?",
      bereich:
        "Hat Ihr Bereich eine klare Vorstellung davon, warum und wofür KI eingesetzt werden soll?",
    },
    questions: [
      {
        id: "F1.1",
        text: {
          solo: "Ich kann klar formulieren, welches Ziel ich mit dem Einsatz von KI erreichen will.",
          kmu: "Wir können klar formulieren, welches Ziel wir mit dem Einsatz von KI in unserem Unternehmen erreichen wollen.",
          bereich:
            "Wir können in unserem Bereich klar formulieren, welches Ziel wir mit dem Einsatz von KI erreichen wollen.",
        },
      },
      {
        id: "F1.2",
        text: {
          solo: "Ich habe mindestens einen konkreten Bereich oder Ablauf identifiziert, in dem KI mir einen spürbaren Mehrwert bringen könnte.",
          kmu: "Wir haben mindestens einen konkreten Bereich oder Ablauf identifiziert, in dem KI einen spürbaren Mehrwert schaffen könnte.",
          bereich:
            "Wir haben in unserem Bereich mindestens einen konkreten Ablauf identifiziert, in dem KI einen spürbaren Mehrwert schaffen könnte.",
        },
      },
      {
        id: "F1.3",
        text: {
          solo: "Meine Motivation für KI basiert auf einem konkreten Verbesserungsziel – nicht auf dem Gefühl, etwas tun zu müssen, weil alle es tun.",
          kmu: "Unsere Motivation für KI basiert auf einem konkreten Verbesserungsziel – nicht auf dem Gefühl, etwas tun zu müssen, weil alle es tun.",
          bereich:
            "Die Motivation unseres Bereichs für KI basiert auf einem konkreten Verbesserungsziel – nicht auf dem Gefühl, etwas tun zu müssen, weil alle es tun.",
        },
      },
      {
        id: "F1.4",
        text: {
          solo: "Ich bin bereit, Zeit und Ressourcen in eine strukturierte KI-Einführung zu investieren.",
          kmu: "Unsere Geschäftsführung steht hinter dem Vorhaben und ist bereit, Zeit und Ressourcen für eine strukturierte Einführung bereitzustellen.",
          bereich:
            "Die Leitung unseres Bereichs steht hinter dem Vorhaben und ist bereit, Zeit und Ressourcen für eine strukturierte Einführung bereitzustellen.",
        },
      },
    ],
  },
  {
    id: "prozesse",
    label: "Prozessreife",
    shortLabel: "Prozesse",
    weight: 1.3,
    isKiller: true,
    killerThreshold: 2.0,
    killerEffect: "downgrade",
    color: "#2E6DA4",
    description: {
      solo: "Sind Ihre Arbeitsabläufe so strukturiert, dass sie als Grundlage für KI-gestützte Optimierung dienen können?",
      kmu: "Sind Ihre Geschäftsprozesse so strukturiert und dokumentiert, dass sie als Grundlage für KI-gestützte Optimierung dienen können?",
      bereich:
        "Sind die Prozesse in Ihrem Bereich so strukturiert und dokumentiert, dass sie als Grundlage für KI-gestützte Optimierung dienen können?",
    },
    questions: [
      {
        id: "F2.1",
        text: {
          solo: "Meine wesentlichen Arbeitsabläufe sind so strukturiert, dass ich sie jederzeit nachvollziehen und reproduzieren kann.",
          kmu: "Unsere wesentlichen Geschäftsprozesse sind dokumentiert und für neue Mitarbeitende nachvollziehbar.",
          bereich:
            "Die wesentlichen Prozesse unseres Bereichs sind dokumentiert und für neue Teammitglieder nachvollziehbar.",
        },
      },
      {
        id: "F2.2",
        text: {
          solo: "Ich weiß, welche meiner Abläufe besonders zeitintensiv oder fehleranfällig sind.",
          kmu: "Wir wissen, welche Abläufe in unserem Unternehmen besonders zeitintensiv oder fehleranfällig sind.",
          bereich:
            "Wir wissen, welche Abläufe in unserem Bereich besonders zeitintensiv oder fehleranfällig sind.",
        },
      },
      {
        id: "F2.3",
        text: {
          solo: "Wiederkehrende Aufgaben erledige ich nach einem festen Ablauf – nicht jedes Mal anders.",
          kmu: "Wiederkehrende Aufgaben laufen bei uns nach einem einheitlichen Standard ab – nicht je nach Person unterschiedlich.",
          bereich:
            "Wiederkehrende Aufgaben laufen in unserem Bereich nach einem einheitlichen Standard ab – nicht je nach Person unterschiedlich.",
        },
      },
      {
        id: "F2.4",
        text: {
          solo: "Meine Arbeitsabläufe sind weitgehend digital – ich arbeite nicht mehr überwiegend mit Papier, manuellen Listen oder isolierten Einzeldateien.",
          kmu: "Unsere Arbeitsabläufe sind weitgehend digitalisiert – wir arbeiten nicht mehr überwiegend mit Papier, manuellen Listen oder isolierten Einzeldateien.",
          bereich:
            "Die Arbeitsabläufe in unserem Bereich sind weitgehend digitalisiert – wir arbeiten nicht mehr überwiegend mit Papier, manuellen Listen oder isolierten Einzeldateien.",
        },
      },
    ],
  },
  {
    id: "daten",
    label: "Datenverfügbarkeit und -qualität",
    shortLabel: "Daten",
    weight: 1.0,
    isKiller: false,
    color: "#3498DB",
    description: {
      solo: "Verfügen Sie über die Datengrundlage, die für sinnvolle KI-Anwendungen erforderlich ist?",
      kmu: "Verfügt Ihr Unternehmen über die Datengrundlage, die für sinnvolle KI-Anwendungen erforderlich ist?",
      bereich:
        "Verfügt Ihr Bereich über die Datengrundlage, die für sinnvolle KI-Anwendungen erforderlich ist?",
    },
    questions: [
      {
        id: "F3.1",
        text: {
          solo: "Ich verfüge über strukturierte digitale Daten zu meinen Kunden, Produkten oder Geschäftsvorgängen.",
          kmu: "Wir verfügen über strukturierte digitale Daten zu unseren Kunden, Produkten oder Geschäftsvorgängen.",
          bereich:
            "In unserem Bereich verfügen wir über strukturierte digitale Daten zu den relevanten Vorgängen.",
        },
      },
      {
        id: "F3.2",
        text: {
          solo: "Meine Daten sind aktuell, vollständig und werden regelmäßig gepflegt.",
          kmu: "Unsere Daten sind aktuell, vollständig und werden regelmäßig gepflegt.",
          bereich:
            "Die Daten in unserem Bereich sind aktuell, vollständig und werden regelmäßig gepflegt.",
        },
      },
      {
        id: "F3.3",
        text: {
          solo: "Meine Daten sind zentral zugänglich – nicht über verschiedene Ordner, Geräte oder Dienste verstreut.",
          kmu: "Unsere Daten sind an zentraler Stelle zugänglich – nicht über verschiedene Systeme, Ordner oder Einzelpersonen verstreut.",
          bereich:
            "Die Daten unseres Bereichs sind zentral zugänglich – nicht über verschiedene Systeme oder Einzelpersonen verstreut.",
        },
      },
      {
        id: "F3.4",
        text: {
          solo: "Ich nutze meine vorhandenen Daten bereits aktiv für Auswertungen, Berichte oder Entscheidungen.",
          kmu: "Wir nutzen unsere vorhandenen Daten bereits aktiv für Auswertungen, Berichte oder Entscheidungen.",
          bereich:
            "Wir nutzen die vorhandenen Daten unseres Bereichs bereits aktiv für Auswertungen oder Entscheidungen.",
        },
      },
    ],
  },
  {
    id: "technik",
    label: "Technische Infrastruktur",
    shortLabel: "Technik",
    weight: 1.0,
    isKiller: false,
    color: "#1ABC9C",
    description: {
      solo: "Ist Ihre technische Basis geeignet, um KI-Werkzeuge sinnvoll einzusetzen?",
      kmu: "Ist die technische Basis vorhanden, um KI-Werkzeuge sinnvoll einzusetzen und zu integrieren?",
      bereich:
        "Ist die technische Basis in Ihrem Bereich vorhanden, um KI-Werkzeuge sinnvoll einzusetzen?",
    },
    questions: [
      {
        id: "F4.1",
        text: {
          solo: "Ich arbeite mit zeitgemäßen digitalen Werkzeugen, die regelmäßig aktualisiert werden.",
          kmu: "Wir arbeiten mit zeitgemäßen IT-Systemen, die regelmäßig aktualisiert und gewartet werden.",
          bereich:
            "In unserem Bereich arbeiten wir mit zeitgemäßen IT-Systemen, die regelmäßig aktualisiert und gewartet werden.",
        },
      },
      {
        id: "F4.2",
        text: {
          solo: "Meine Werkzeuge lassen sich miteinander verbinden oder über Schnittstellen verknüpfen.",
          kmu: "Unsere Systeme verfügen über Schnittstellen oder lassen sich mit anderen Werkzeugen verbinden.",
          bereich:
            "Die Systeme unseres Bereichs verfügen über Schnittstellen oder lassen sich mit anderen Werkzeugen verbinden.",
        },
      },
      {
        id: "F4.3",
        text: {
          solo: "Ich habe Zugang zu technischer Unterstützung, wenn ich neue digitale Werkzeuge einführen will.",
          kmu: "Wir haben intern oder extern Zugang zu IT-Kompetenz, die neue digitale Werkzeuge einführen und betreuen kann.",
          bereich:
            "Wir haben in unserem Bereich intern oder extern Zugang zu IT-Kompetenz, die neue Werkzeuge einführen und betreuen kann.",
        },
      },
      {
        id: "F4.4",
        text: {
          solo: "Ich kann neue Software oder Cloud-Dienste ohne größere Hürden in meinen Arbeitsalltag integrieren.",
          kmu: "Unsere IT-Infrastruktur ermöglicht es, neue Software oder Cloud-Dienste ohne größere Hürden einzuführen.",
          bereich:
            "Die IT-Infrastruktur unseres Bereichs ermöglicht es, neue Software oder Cloud-Dienste ohne größere Hürden einzuführen.",
        },
      },
    ],
  },
  {
    id: "menschen",
    label: "Mitarbeiterkompetenz und Veränderungsbereitschaft",
    shortLabel: "Menschen",
    weight: 1.0,
    isKiller: false,
    color: "#8E44AD",
    description: {
      solo: "Sind Sie bereit und in der Lage, mit KI-gestützten Werkzeugen zu arbeiten?",
      kmu: "Sind Ihre Mitarbeitenden bereit und in der Lage, mit KI-gestützten Werkzeugen zu arbeiten?",
      bereich:
        "Sind die Mitarbeitenden in Ihrem Bereich bereit und in der Lage, mit KI-gestützten Werkzeugen zu arbeiten?",
    },
    questions: [
      {
        id: "F5.1",
        text: {
          solo: "Ich stehe neuen digitalen Werkzeugen grundsätzlich offen gegenüber.",
          kmu: "Unsere Mitarbeitenden stehen neuen digitalen Werkzeugen grundsätzlich offen gegenüber.",
          bereich:
            "Die Mitarbeitenden in unserem Bereich stehen neuen digitalen Werkzeugen grundsätzlich offen gegenüber.",
        },
      },
      {
        id: "F5.2",
        text: {
          solo: "Ich nutze bereits eigenständig KI-Werkzeuge wie ChatGPT, Copilot oder ähnliche Anwendungen.",
          kmu: "Im Unternehmen gibt es bereits Mitarbeitende, die eigenständig KI-Werkzeuge wie ChatGPT, Copilot oder ähnliche Anwendungen nutzen.",
          bereich:
            "In unserem Bereich gibt es bereits Mitarbeitende, die eigenständig KI-Werkzeuge wie ChatGPT, Copilot oder ähnliche Anwendungen nutzen.",
        },
      },
      {
        id: "F5.3",
        text: {
          solo: "Ich investiere regelmäßig in meine eigene Weiterbildung im digitalen Bereich.",
          kmu: "Wir investieren regelmäßig in Weiterbildung und Kompetenzentwicklung im digitalen Bereich.",
          bereich:
            "In unserem Bereich wird regelmäßig in Weiterbildung und Kompetenzentwicklung im digitalen Bereich investiert.",
        },
      },
      {
        id: "F5.4",
        text: {
          solo: "Veränderungen in meinen Werkzeugen und Abläufen sehe ich als Chance zur Verbesserung – nicht als Belastung.",
          kmu: "Veränderungen in Abläufen und Werkzeugen werden bei uns als Chance zur Verbesserung wahrgenommen – nicht als Bedrohung.",
          bereich:
            "Veränderungen in Abläufen und Werkzeugen werden in unserem Bereich als Chance zur Verbesserung wahrgenommen – nicht als Bedrohung.",
        },
      },
    ],
  },
  {
    id: "regulatorik",
    label: "Regulatorische Bereitschaft",
    shortLabel: "Regulatorik",
    weight: 0.8,
    isKiller: false,
    color: "#E8720C",
    description: {
      solo: "Sind Sie sich der rechtlichen Rahmenbedingungen für den KI-Einsatz bewusst?",
      kmu: "Ist sich Ihr Unternehmen der rechtlichen Rahmenbedingungen für den KI-Einsatz bewusst?",
      bereich:
        "Ist sich Ihr Bereich der rechtlichen Rahmenbedingungen für den KI-Einsatz bewusst?",
    },
    questions: [
      {
        id: "F6.1",
        text: {
          solo: "Ich weiß, dass es mit dem EU AI Act gesetzliche Vorgaben für den Einsatz von KI gibt.",
          kmu: "Wir wissen, dass es mit dem EU AI Act gesetzliche Vorgaben für den Einsatz von KI in Unternehmen gibt.",
          bereich:
            "In unserem Bereich ist bekannt, dass es mit dem EU AI Act gesetzliche Vorgaben für den Einsatz von KI gibt.",
        },
      },
      {
        id: "F6.2",
        text: {
          solo: "Ich habe klare Regeln für den Umgang mit personenbezogenen Daten und setze die DSGVO aktiv um.",
          kmu: "Wir haben klare Regeln für den Umgang mit personenbezogenen Daten und setzen die DSGVO aktiv um.",
          bereich:
            "In unserem Bereich gibt es klare Regeln für den Umgang mit personenbezogenen Daten und die DSGVO wird aktiv umgesetzt.",
        },
      },
      {
        id: "F6.3",
        text: {
          solo: "Ich habe mich bereits damit beschäftigt, welche Vorgaben des EU AI Act für meine Tätigkeit gelten könnten.",
          kmu: "Wir haben uns bereits damit beschäftigt, welche Vorgaben des EU AI Act für unsere Branche oder unseren KI-Einsatz gelten könnten.",
          bereich:
            "Wir haben uns in unserem Bereich bereits damit beschäftigt, welche Vorgaben des EU AI Act für unseren KI-Einsatz gelten könnten.",
        },
      },
      {
        id: "F6.4",
        text: {
          solo: "Ich wäre in der Lage, die Nutzung von KI-Werkzeugen gegenüber Kunden oder Partnern transparent zu erklären.",
          kmu: "Wir wären in der Lage, die Nutzung von KI-Werkzeugen in unserem Unternehmen gegenüber Kunden, Partnern oder Aufsichtsbehörden transparent zu erklären.",
          bereich:
            "Wir wären in der Lage, die Nutzung von KI-Werkzeugen in unserem Bereich gegenüber internen Stakeholdern oder Aufsichtsbehörden transparent zu erklären.",
        },
      },
    ],
  },
];

export const SCALE_OPTIONS: ScaleOption[] = [
  { value: 1, label: "Trifft nicht zu" },
  { value: 2, label: "Trifft eher nicht zu" },
  { value: 3, label: "Trifft eher zu" },
  { value: 4, label: "Trifft voll zu" },
];

export const TOTAL_WEIGHT = DIMENSIONS.reduce((s, d) => s + d.weight, 0);
export const TOTAL_QUESTIONS = DIMENSIONS.reduce(
  (s, d) => s + d.questions.length,
  0
);
