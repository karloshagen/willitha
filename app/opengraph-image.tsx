import { ImageResponse } from "next/og";

export const alt = "Will It HA — Australian solar and battery Home Assistant compatibility";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f3efe4",
          color: "#17241c",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#1b6b43", fontWeight: 700 }}>
          Will It HA · Australia
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.05, maxWidth: 980 }}>
            Will it work with Home Assistant?
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 32, color: "#5c6a62" }}>
            Batteries and inverters sold in Australia.
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 24 }}>
          <div style={{ display: "flex", background: "#e7f4ec", color: "#1b6b43", padding: "8px 16px", borderRadius: 999 }}>
            Local
          </div>
          <div style={{ display: "flex", background: "#f8ecdf", color: "#9a531f", padding: "8px 16px", borderRadius: 999 }}>
            Control
          </div>
          <div style={{ display: "flex", background: "#e5f1f6", color: "#1e4f68", padding: "8px 16px", borderRadius: 999 }}>
            Energy Dashboard
          </div>
        </div>
      </div>
    ),
    size,
  );
}
