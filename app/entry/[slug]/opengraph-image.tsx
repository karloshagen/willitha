import { ImageResponse } from "next/og";
import { energyLabel, localLabel, controlLabel } from "@/lib/classify";
import { getEntry } from "@/lib/entries";
import { logoLockupSrc } from "@/lib/logo-lockup";

export const alt = "Will It HA model";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function EntryImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await getEntry(slug);
  const title = entry ? `${entry.brand} ${entry.model}` : "Will It HA";
  const detail = entry
    ? `${localLabel(entry.local)} · ${controlLabel(entry.control)} · ${energyLabel(entry.energy_dashboard)}`
    : "Australian Home Assistant solar directory";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#14181c",
          padding: "72px",
        }}
      >
        <img src={logoLockupSrc()} width={480} height={100} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 60, fontWeight: 700, lineHeight: 1.08, maxWidth: 1000 }}>{title}</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "#5d6670" }}>{detail}</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#03A9F4" }}>willitha.au</div>
      </div>
    ),
    size,
  );
}
