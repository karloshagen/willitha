import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "react-email";

export type NewsletterPick = {
  title: string;
  detail: string;
  href: string;
};

export type NewsletterProps = {
  preview: string;
  picks: NewsletterPick[];
  sponsorName: string;
  sponsorHref: string;
};

const defaultPicks: NewsletterPick[] = [
  {
    title: "Sigenergy SigenStor",
    detail: "Local Modbus or cloud, with work-mode and export-limit control.",
    href: "https://willitha.au/entry/sigenergy-sigenstor",
  },
  {
    title: "GoodWe ET / EH",
    detail: "Official core integration, local sensors, best Energy Dashboard coverage.",
    href: "https://willitha.au/entry/goodwe-et",
  },
  {
    title: "iStore hybrid",
    detail: "The Huawei SUN2000 rebadge common in Australia. Local Modbus can control it.",
    href: "https://willitha.au/entry/istore-hybrid",
  },
  {
    title: "Sungrow SH-RS",
    detail: "HACS plus a Modbus pack. A cable into the inverter beats the WiNet dongle.",
    href: "https://willitha.au/entry/sungrow-sh-rs",
  },
  {
    title: "Selectronic SP PRO",
    detail: "No official integration. Local read-only via select.live REST or MQTT.",
    href: "https://willitha.au/entry/selectronic-sp-pro",
  },
];

export default function Newsletter({
  preview = "Five Australian Home Assistant solar picks this week.",
  picks = defaultPicks,
  sponsorName = "Your company",
  sponsorHref = "https://willitha.au/go/example-sponsor",
}: NewsletterProps) {
  return (
    <Html lang="en-AU">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                paper: "#f3efe4",
                ink: "#17241c",
                eucalyptus: "#03A9F4",
                muted: "#5c6a62",
              },
            },
          },
        }}
      >
        <Head />
        <Body className="bg-white font-sans text-ink">
          <Preview>{preview}</Preview>
          <Container className="mx-auto max-w-xl px-5 py-8">
            <Text className="m-0 text-sm font-semibold text-eucalyptus">Will It HA · Australia</Text>
            <Heading className="mt-2 mb-2 text-2xl leading-tight text-ink">This week in the directory</Heading>
            <Text className="mt-0 text-base leading-6 text-muted">
              Five models worth knowing if you are choosing, or already running, a battery on Home Assistant.
            </Text>
            {picks.slice(0, 5).map((pick) => (
              <Section key={pick.href} className="mt-3">
                <Text className="m-0 text-base leading-6">
                  <Link href={pick.href} className="font-semibold text-eucalyptus no-underline">
                    {pick.title}
                  </Link>
                  <span className="text-ink"> — {pick.detail}</span>
                </Text>
              </Section>
            ))}
            <Hr className="my-6 border-solid border-[#ddd4c4]" />
            <Text className="m-0 text-sm leading-6 text-ink">
              Sponsored by{" "}
              <Link href={sponsorHref} className="text-eucalyptus">
                {sponsorName}
              </Link>
              .
            </Text>
            <Text className="mt-4 text-xs leading-5 text-muted">
              Will It HA is a community directory of Australian solar batteries and inverters. Verify before you buy.
              Some links are sponsor or affiliate links.
            </Text>
            <Text className="mt-2 text-xs leading-5 text-muted">
              <a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

Newsletter.PreviewProps = {
  preview: "Five Australian Home Assistant solar picks this week.",
  picks: defaultPicks,
  sponsorName: "Your company",
  sponsorHref: "https://willitha.au/go/example-sponsor",
} satisfies NewsletterProps;
