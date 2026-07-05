import { ImageResponse } from "next/og";

export const alt = "Pathway AI: reach career-ready in 4 steps";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const ring = {
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    border: "5px solid rgba(255,255,255,0.85)",
  };

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "#041336",
          backgroundImage:
            "radial-gradient(circle at 18% 20%, rgba(96,165,250,0.28), transparent 55%)",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "22px", marginBottom: "48px" }}>
          <div style={ring} />
          <div style={ring} />
          <div style={ring} />
          <div style={{ width: "48px", height: "48px", borderRadius: "999px", background: "#60a5fa" }} />
        </div>
        <div style={{ display: "flex", fontSize: "44px", fontWeight: 700, color: "#93c5fd", marginBottom: "14px" }}>
          Pathway AI
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "76px",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-3px",
            maxWidth: "940px",
          }}
        >
          Reach career-ready in 4 steps.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "32px",
            color: "rgba(255,255,255,0.72)",
            marginTop: "40px",
            maxWidth: "900px",
          }}
        >
          Resume checker, career paths, skill roadmaps, and interview practice. Free.
        </div>
      </div>
    ),
    { ...size },
  );
}
