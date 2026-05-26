import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Joyride, STATUS, type EventData, type Step } from "react-joyride";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { HelpCircle, Lightbulb, PlayCircle, X } from "lucide-react";

const tutorialSteps: Step[] = [
  {
    target: "[data-guide=\"dashboard\"]",
    content: "This dashboard summarizes startup name, style, platform targets, and completion progress.",
    skipBeacon: true
  },
  {
    target: "[data-guide=\"name-startup\"]",
    content: "Start here by entering your startup name. This drives logo marks and generated assets."
  },
  {
    target: "[data-guide=\"visual-assets\"]",
    content: "Generate unified hero visuals and screenshot direction from your current brand context."
  },
  {
    target: "[data-guide=\"landing-page\"]",
    content: "Generate the landing page after assets so copy, colors, and style remain consistent."
  },
  {
    target: "[data-guide=\"export-kit\"]",
    content: "Export your launch package after checks pass for compatibility and deployment readiness."
  }
];

export function HelpTip({ children, text }: { children: ReactNode; text: string }) {
  return (
    <Tippy
      animation="scale"
      content={<div style={tipBubbleStyle}>{text}</div>}
      placement="top"
    >
      <span style={{ cursor: "help" }}>{children}</span>
    </Tippy>
  );
}

export default function SmartGuide() {
  const [runTour, setRunTour] = useState(false);
  const [showHelpBubble, setShowHelpBubble] = useState(false);

  useEffect(() => {
    const completed = window.localStorage.getItem("smart-guide-completed");
    if (completed) return;

    const timer = window.setTimeout(() => setRunTour(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  function handleJoyrideEvent(data: EventData) {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      window.localStorage.setItem("smart-guide-completed", "true");
      setRunTour(false);
    }
  }

  return (
    <>
      <Joyride
        continuous
        onEvent={handleJoyrideEvent}
        options={{
          backgroundColor: "#ffffff",
          buttons: ["back", "close", "skip", "primary"],
          primaryColor: "#2563eb",
          showProgress: true,
          textColor: "#111827",
          zIndex: 10000
        }}
        run={runTour}
        scrollToFirstStep
        steps={tutorialSteps}
      />

      <button
        aria-label="Open smart guide"
        onClick={() => setShowHelpBubble((current) => !current)}
        style={floatingButtonStyle}
        type="button"
      >
        <HelpCircle size={28} />
      </button>

      {showHelpBubble ? (
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>
              <Lightbulb size={20} />
              Help Center
            </div>

            <button
              aria-label="Close smart guide"
              onClick={() => setShowHelpBubble(false)}
              style={plainButtonStyle}
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          <div style={panelActionsStyle}>
            <button
              onClick={() => {
                setRunTour(true);
                setShowHelpBubble(false);
              }}
              style={primaryActionStyle}
              type="button"
            >
              <PlayCircle size={18} />
              Restart Tutorial
            </button>

            <div style={tipStyle}>Hover info icons and labels to read quick feature explanations.</div>
            <div style={tipStyle}>Complete Brand Identity and Visual Assets before export for best results.</div>
            <div style={tipStyle}>Export validation and deploy readiness must pass for strict deploy actions.</div>
            <div style={tipStyle}>Use Railway bundle export when you want a deploy-focused package.</div>
          </div>
        </div>
      ) : null}
    </>
  );
}

const floatingButtonStyle: CSSProperties = {
  position: "fixed",
  bottom: 24,
  right: 24,
  width: 58,
  height: 58,
  borderRadius: "50%",
  background: "#2563eb",
  border: "none",
  color: "#ffffff",
  cursor: "pointer",
  zIndex: 9999,
  boxShadow: "0 10px 30px rgba(0,0,0,0.18)"
};

const panelStyle: CSSProperties = {
  position: "fixed",
  bottom: 95,
  right: 24,
  width: 340,
  background: "#ffffff",
  borderRadius: 18,
  padding: 20,
  zIndex: 9999,
  boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
  border: "1px solid #e5e7eb"
};

const panelHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16
};

const panelTitleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 700,
  fontSize: 18
};

const plainButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  cursor: "pointer"
};

const panelActionsStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12
};

const primaryActionStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14
};

const tipStyle: CSSProperties = {
  background: "#f3f4f6",
  padding: 12,
  borderRadius: 12,
  fontSize: 13,
  lineHeight: 1.5
};

const tipBubbleStyle: CSSProperties = {
  maxWidth: 250,
  fontSize: 13,
  lineHeight: 1.5,
  padding: 4
};
