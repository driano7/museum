import React, { useMemo, useState } from "react";
import { motion } from "framer-motion/dist/framer-motion";
import { Search, User, CalendarDays, MapPin, QrCode, Stamp, ShieldCheck, ChevronRight, Star } from "lucide-react";

import PassportThemeToggle from "./PassportThemeToggle";

const tabs = [
  { id: "portada", label: "Portada" },
  { id: "visas", label: "Visas" },
  { id: "sellos", label: "Sellos" },
  { id: "checkin", label: "Check-in" },
  { id: "perfil", label: "Perfil" },
];

const events = [
  {
    id: 1,
    title: "Festival Nocturno",
    city: "CDMX",
    venue: "Palacio Central",
    date: "12 OCT 2026",
    access: "VISA VIP",
    code: "MXA-0921-44",
    gate: "A-18",
    seat: "B12",
    status: "ACTIVA",
    accent: "rose",
  },
  {
    id: 2,
    title: "Design & Motion Expo",
    city: "Guadalajara",
    venue: "Foro Canvas",
    date: "28 NOV 2026",
    access: "GENERAL",
    code: "GDL-1128-19",
    gate: "C-04",
    seat: "L07",
    status: "PENDIENTE",
    accent: "blue",
  },
  {
    id: 3,
    title: "Web3 Summit LATAM",
    city: "Monterrey",
    venue: "Distrito Tech",
    date: "05 DIC 2026",
    access: "PRESS",
    code: "MTY-1205-88",
    gate: "VIP-2",
    seat: "S/N",
    status: "VALIDADA",
    accent: "green",
  },
];

const stamps = [
  {
    city: "CDMX",
    date: "12 OCT 2026",
    angle: "-rotate-6",
    tone: "text-rose-900 border-rose-900/35 dark:text-rose-300 dark:border-rose-300/35",
  },
  {
    city: "GDL",
    date: "28 NOV 2026",
    angle: "rotate-6",
    tone: "text-sky-900 border-sky-900/35 dark:text-sky-300 dark:border-sky-300/35",
  },
  {
    city: "MTY",
    date: "05 DIC 2026",
    angle: "-rotate-3",
    tone: "text-emerald-900 border-emerald-900/35 dark:text-emerald-300 dark:border-emerald-300/35",
  },
];

const themeMap = {
  light: {
    appBg: "bg-[linear-gradient(180deg,#9f7a55_0%,#7d5b3d_100%)]",
    heroText: "text-[#f5ebd7]",
    heroSubtle: "text-[#f7efdf]/80",
    toggleWrap: "border-[#320000]/35 bg-white/10 text-white hover:bg-[#320000]/12",
    spreadShell:
      "border-[#320000]/20 bg-[linear-gradient(180deg,#ead9bb_0%,#dbc39d_100%)] shadow-[0_25px_80px_rgba(42,23,9,0.35)]",
    spineOuter: "bg-[linear-gradient(180deg,#4b0d0d_0%,#320000_100%)]",
    spineInner: "bg-[#220000]",
    page: "border-[#320000]/14 bg-[linear-gradient(180deg,#f8f0e0_0%,#f0e2ca_100%)]",
    line: "border-[#320000]/14",
    label: "text-[#8a7357]",
    title: "text-[#4f3c2a]",
    body: "text-[#5c4937]",
    chip: "border-[#320000]/20 text-[#7b6248] bg-transparent",
    chipSolid: "border-[#320000]/30 bg-[#f0dfdf] text-[#4f3c2a]",
    chipGhost: "border-[#320000]/12 bg-[#fbf5ea] text-[#7b6248] hover:bg-[#f8ecec]",
    card: "border-[#320000]/14 bg-[linear-gradient(180deg,#f7efdf_0%,#efe2ca_100%)]",
    field: "border-[#320000]/10 bg-[#fbf5ea]",
    mutedCard: "border-[#320000]/14 bg-[#f3e7d3]",
    note: "border-[#320000]/20 bg-[#f3e7d4]",
    dashed: "border-[#320000]/18 bg-[#f8f1e3]",
    qrWrap: "border-[#320000]/14 bg-white",
    qrInner: "border-[#320000]/10 bg-[#faf5eb] text-[#4f3c2a]",
    coverShadow: "bg-[#422819] opacity-35",
    cover: "border-[#320000]/28 bg-[linear-gradient(180deg,#5c3722_0%,#4a2c1b_100%)] text-[#e5cb98]",
    coverOuter: "border-[#320000]/16",
    coverLine1: "bg-[#320000]/45",
    coverLine2: "bg-[#320000]/20",
    coverText: "text-[#ead7b2]/75",
    input: "border-[#320000]/14 bg-[#fbf5ea] text-[#4f3c2a] placeholder:text-[#9a856d]",
    primaryBtn: "bg-[#320000] text-[#f7efdf] hover:bg-[#4a0000]",
    secondaryBtn: "border-[#320000]/16 bg-[#fbf5ea] text-[#4f3c2a] hover:bg-[#f8ecec]",
    tabActive: "bg-[#ead0d0] text-[#4c3826] border-[#320000]/25",
    tabInactive: "bg-[#eadbc0] text-[#7b6248] border-[#320000]/18 hover:bg-[#f3e3e3]",
    visaStrip: "bg-[#320000]",
    visaBg: "border-[#320000]/14 bg-[linear-gradient(180deg,#f7efdf_0%,#f1e5d1_100%)]",
    visaSelected: "border-[#320000]/35 ring-[#320000]/18",
    badgeNeutral: "border-[#320000]/18 bg-[#f3e3e3] text-[#5e4a35] hover:bg-[#f3e3e3]",
    stampStatus: "border-[#320000]/25 text-[#5e4a35]",
    statusBadge: {
      rose: "border-[#320000]/18 text-[#5e4a35] bg-[#f7e9e9]",
      blue: "border-[#320000]/18 text-[#5e4a35] bg-[#f7efdf]",
      green: "border-[#320000]/18 text-[#5e4a35] bg-[#efe7d8]",
    },
  },
  dark: {
    appBg: "bg-[linear-gradient(180deg,#111827_0%,#0b1020_100%)]",
    heroText: "text-[#e7dcc4]",
    heroSubtle: "text-[#d3c8b2]/80",
    toggleWrap: "border-[#D4AF37]/28 bg-[#111826]/70 text-[#ecd9b7] hover:bg-[#D4AF37]/10",
    spreadShell:
      "border-[#D4AF37]/20 bg-[linear-gradient(180deg,#2a2119_0%,#1c1611_100%)] shadow-[0_25px_80px_rgba(0,0,0,0.55)]",
    spineOuter: "bg-[linear-gradient(180deg,#5a4820_0%,#D4AF37_100%)]",
    spineInner: "bg-[#3a2f12]",
    page: "border-[#D4AF37]/16 bg-[linear-gradient(180deg,#1f1914_0%,#16120e_100%)]",
    line: "border-[#D4AF37]/16",
    label: "text-[#bfa785]",
    title: "text-[#f1e4c9]",
    body: "text-[#d6c5a9]",
    chip: "border-[#D4AF37]/22 text-[#c7af8f] bg-transparent",
    chipSolid: "border-[#D4AF37]/32 bg-[#3a3017] text-[#f0dec0]",
    chipGhost: "border-[#D4AF37]/14 bg-[#201912] text-[#c7b290] hover:bg-[#2b2414]",
    card: "border-[#D4AF37]/16 bg-[linear-gradient(180deg,#221b15_0%,#1a1510_100%)]",
    field: "border-[#D4AF37]/14 bg-[#17120e]",
    mutedCard: "border-[#D4AF37]/16 bg-[#211a14]",
    note: "border-[#D4AF37]/18 bg-[#1c1712]",
    dashed: "border-[#D4AF37]/18 bg-[#18130f]",
    qrWrap: "border-[#D4AF37]/16 bg-[#14100d]",
    qrInner: "border-[#D4AF37]/14 bg-[#0f0c09] text-[#f1e4c9]",
    coverShadow: "bg-black opacity-40",
    cover: "border-[#D4AF37]/24 bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] text-[#d8b67c]",
    coverOuter: "border-[#D4AF37]/18",
    coverLine1: "bg-[#D4AF37]/40",
    coverLine2: "bg-[#D4AF37]/18",
    coverText: "text-[#e0c89d]/70",
    input: "border-[#D4AF37]/16 bg-[#17120e] text-[#f1e4c9] placeholder:text-[#8f7a60]",
    primaryBtn: "bg-[#D4AF37] text-[#1a140f] hover:bg-[#c39a2f]",
    secondaryBtn: "border-[#D4AF37]/16 bg-[#17120e] text-[#f1e4c9] hover:bg-[#2a2114]",
    tabActive: "bg-[#3f3417] text-[#f0dec0] border-[#D4AF37]/28",
    tabInactive: "bg-[#241c15] text-[#b99d79] border-[#D4AF37]/14 hover:bg-[#2d2418]",
    visaStrip: "bg-[#D4AF37]",
    visaBg: "border-[#D4AF37]/16 bg-[linear-gradient(180deg,#211913_0%,#19130f_100%)]",
    visaSelected: "border-[#D4AF37]/38 ring-[#D4AF37]/18",
    badgeNeutral: "border-[#D4AF37]/18 bg-[#221b15] text-[#e5d2b2] hover:bg-[#221b15]",
    stampStatus: "border-[#D4AF37]/28 text-[#e5d2b2]",
    statusBadge: {
      rose: "border-[#D4AF37]/18 text-[#e5d2b2] bg-[#3a2d12]",
      blue: "border-[#D4AF37]/18 text-[#e5d2b2] bg-[#2a2418]",
      green: "border-[#D4AF37]/18 text-[#e5d2b2] bg-[#1f1a12]",
    },
  },
};

const StatusBadge = ({ text, className }) => (
  <span
    className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] shadow-none ${className}`}
  >
    {text}
  </span>
);

function TabEdge({ label, active, index, onClick, theme }) {
  return (
    <button
      onClick={onClick}
      className={`absolute right-[-54px] flex h-12 w-[110px] items-center justify-center rounded-r-2xl border border-l-0 text-[11px] font-semibold uppercase tracking-[0.28em] shadow-sm transition ${
        active ? theme.tabActive : theme.tabInactive
      }`}
      style={{ top: `${32 + index * 58}px` }}
    >
      {label}
    </button>
  );
}

function PassportCover({ theme }) {
  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <div className={`absolute inset-y-3 left-3 w-full rounded-[28px] blur-md ${theme.coverShadow}`} />
      <div className={`relative rounded-[30px] border p-6 shadow-2xl ${theme.cover}`}>
        <div className={`absolute inset-y-0 left-6 w-[2px] ${theme.coverLine1}`} />
        <div className={`absolute inset-y-0 left-8 w-[1px] ${theme.coverLine2}`} />

        <div className={`flex min-h-[520px] flex-col justify-between rounded-[24px] border p-6 ${theme.coverOuter}`}>
          <div className="space-y-6 text-center">
            <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full border border-current/30">
              <Star className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.55em] opacity-80">Republica de</p>
              <h1 className="mt-3 text-2xl font-semibold tracking-[0.22em]">EVENTOS</h1>
              <p className="mt-3 text-[11px] uppercase tracking-[0.45em] opacity-75">Ticket Passport</p>
            </div>
          </div>

          <div className="space-y-3 text-center">
            <div className="mx-auto w-fit rounded-full border border-current/20 px-4 py-2 text-[10px] uppercase tracking-[0.35em]">
              Documento de acceso
            </div>
            <p className={`text-xs leading-6 ${theme.coverText}`}>
              La interfaz ahora se siente como una libreta de pasaporte real: tapa, costura, papel, sellos y paginas
              interiores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataField({ theme, label, value }) {
  return (
    <div className={`rounded-[16px] border p-3 ${theme.field}`}>
      <p className={`text-[10px] uppercase tracking-[0.3em] ${theme.label}`}>{label}</p>
      <p className={`mt-2 text-sm font-medium ${theme.title}`}>{value}</p>
    </div>
  );
}

function PassportIdPage({ theme }) {
  return (
    <div className={`rounded-[24px] border p-5 shadow-sm ${theme.card}`}>
      <div className={`flex items-start justify-between gap-4 border-b pb-4 ${theme.line}`}>
        <div>
          <p className={`text-[10px] uppercase tracking-[0.42em] ${theme.label}`}>Republica de eventos</p>
          <h3 className={`mt-2 text-xl font-semibold tracking-[0.08em] ${theme.title}`}>Pasaporte del portador</h3>
        </div>
        <div
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] ${theme.chip}`}
        >
          Oficial
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[112px_1fr] gap-4">
        <div className={`rounded-[18px] border p-3 ${theme.field}`}>
          <div
            className={`flex h-[140px] items-center justify-center rounded-[12px] border border-current/10 ${theme.field} ${theme.label}`}
          >
            <User className="h-14 w-14" />
          </div>
          <div className={`mt-3 text-center text-[10px] uppercase tracking-[0.25em] ${theme.label}`}>Foto</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <DataField theme={theme} label="Nombre" value="Guillermo A. Martinez" />
          <DataField theme={theme} label="Nacionalidad" value="Asistente / Visitante" />
          <DataField theme={theme} label="No. pasaporte" value="EVT-MX-2026-001" />
          <DataField theme={theme} label="Emision" value="Ciudad de Mexico" />
          <DataField theme={theme} label="Fecha de registro" value="01 SEP 2026" />
          <DataField theme={theme} label="Expira" value="31 DIC 2026" />
        </div>
      </div>
    </div>
  );
}

function VisaTicket({ event, selected, theme }) {
  return (
    <button
      className={`relative w-full overflow-hidden rounded-[22px] border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${
        theme.visaBg
      } ${selected ? `${theme.visaSelected} ring-2` : ""}`}
    >
      <div className={`absolute inset-y-0 left-0 w-3 ${theme.visaStrip}`} />
      <div className="ml-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`text-[10px] uppercase tracking-[0.35em] ${theme.label}`}>Visa de acceso</p>
            <h4 className={`mt-2 text-base font-semibold ${theme.title}`}>{event.title}</h4>
          </div>
          <StatusBadge text={event.status} className={theme.statusBadge[event.accent]} />
        </div>

        <div className={`mt-4 grid gap-2 text-sm ${theme.body}`}>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {event.city} · {event.venue}
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> {event.date}
          </div>
        </div>

        <div className={`mt-4 flex items-center justify-between border-t border-dashed pt-3 ${theme.line}`}>
          <div>
            <p className={`text-[10px] uppercase tracking-[0.3em] ${theme.label}`}>Codigo</p>
            <p className={`mt-1 text-sm font-medium ${theme.title}`}>{event.code}</p>
          </div>
          <ChevronRight className={`h-4 w-4 ${theme.label}`} />
        </div>
      </div>
    </button>
  );
}

function FullPageVisa({ event, theme }) {
  return (
    <div className={`relative rounded-[26px] border p-5 shadow-sm ${theme.card}`}>
      <div
        className={`absolute right-5 top-5 rotate-[-10deg] rounded-full border-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] ${theme.stampStatus}`}
      >
        {event.status}
      </div>

      <div className={`flex items-start justify-between gap-4 border-b pb-4 ${theme.line}`}>
        <div>
          <p className={`text-[10px] uppercase tracking-[0.45em] ${theme.label}`}>Visa de evento</p>
          <h3 className={`mt-2 text-2xl font-semibold tracking-[0.06em] ${theme.title}`}>{event.title}</h3>
          <p className={`mt-2 text-sm leading-6 ${theme.body}`}>
            La entrada vive como una visa impresa dentro del pasaporte, no como una tarjeta digital suelta.
          </p>
        </div>
        <StatusBadge text={event.access} className={theme.badgeNeutral} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <DataField theme={theme} label="Destino" value={event.city} />
          <DataField theme={theme} label="Lugar" value={event.venue} />
          <DataField theme={theme} label="Fecha" value={event.date} />
          <DataField theme={theme} label="Folio" value={event.code} />
          <DataField theme={theme} label="Puerta" value={event.gate} />
          <DataField theme={theme} label="Asiento" value={event.seat} />
        </div>

        <div className={`rounded-[22px] border border-dashed p-4 ${theme.note}`}>
          <div className={`flex items-center gap-2 ${theme.body}`}>
            <Stamp className="h-4 w-4" />
            <p className="text-[10px] uppercase tracking-[0.35em]">Control de acceso</p>
          </div>
          <div className={`mt-4 flex items-center justify-center rounded-[18px] border p-6 ${theme.qrWrap}`}>
            <div className={`flex h-36 w-36 items-center justify-center rounded-[18px] border ${theme.qrInner}`}>
              <QrCode className="h-20 w-20" />
            </div>
          </div>
          <div className={`mt-4 flex items-center gap-2 text-sm ${theme.body}`}>
            <ShieldCheck className="h-4 w-4" /> Validacion en puerta
          </div>
        </div>
      </div>
    </div>
  );
}

function StampSheet({ theme }) {
  return (
    <div className={`rounded-[24px] border p-5 shadow-sm ${theme.card}`}>
      <div className={`flex items-center justify-between gap-4 border-b pb-4 ${theme.line}`}>
        <div>
          <p className={`text-[10px] uppercase tracking-[0.45em] ${theme.label}`}>Pagina de sellos</p>
          <h3 className={`mt-2 text-xl font-semibold ${theme.title}`}>Historial de asistencias</h3>
        </div>
        <div
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${theme.chip}`}
        >
          Coleccionable
        </div>
      </div>

      <div className={`relative mt-5 min-h-[220px] rounded-[18px] border border-dashed p-4 ${theme.dashed}`}>
        {stamps.map((stamp, index) => (
          <div
            key={stamp.city}
            className={`absolute flex h-28 w-28 flex-col items-center justify-center rounded-full border-2 bg-transparent text-center ${stamp.angle} ${stamp.tone}`}
            style={{
              top: `${24 + (index % 2) * 78}px`,
              left: `${24 + index * 92}px`,
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em]">Entrada</p>
            <p className="mt-1 text-lg font-semibold">{stamp.city}</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.18em]">{stamp.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TicketPassportUI() {
  const [activeTab, setActiveTab] = useState("visas");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(1);
  const [themeMode, setThemeMode] = useState("light");

  const theme = themeMap[themeMode];

  const filteredEvents = useMemo(() => {
    if (!query.trim()) return events;
    return events.filter(event =>
      [event.title, event.city, event.venue, event.access].join(" ").toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  const selectedEvent = events.find(event => event.id === selectedId) || events[0];

  return (
    <div className={`min-h-screen p-4 transition-colors md:p-8 ${theme.appBg}`}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className={`max-w-3xl ${theme.heroText}`}>
            <p className="text-[11px] uppercase tracking-[0.45em] opacity-80">Direccion visual</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              Ticketera convertida en pasaporte literal
            </h1>
            <p className={`mt-4 text-base leading-7 ${theme.heroSubtle}`}>
              Aqui el sistema ya no usa un guino visual. La plataforma parece una libreta de pasaporte real con
              cubierta, paginas, visados, sellos y pestanas laterales.
            </p>
          </div>

          <div className="flex justify-start lg:justify-end">
            <PassportThemeToggle
              themeMode={themeMode}
              theme={theme}
              onToggle={() => setThemeMode(prev => (prev === "light" ? "dark" : "light"))}
            />
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[300px_1fr]">
          <PassportCover theme={theme} />

          <div className="relative">
            <div
              className={`absolute inset-y-6 left-1/2 z-10 hidden w-[26px] -translate-x-1/2 rounded-full shadow-inner lg:block ${theme.spineOuter}`}
            />
            <div
              className={`absolute inset-y-10 left-1/2 z-20 hidden w-[10px] -translate-x-1/2 rounded-full lg:block ${theme.spineInner}`}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`relative overflow-visible rounded-[34px] border p-3 ${theme.spreadShell}`}
            >
              {tabs.map((tab, index) => (
                <TabEdge
                  key={tab.id}
                  label={tab.label}
                  active={activeTab === tab.id}
                  index={index}
                  onClick={() => setActiveTab(tab.id)}
                  theme={theme}
                />
              ))}

              <div className="grid gap-3 lg:grid-cols-2">
                <div className={`rounded-[28px] border p-5 lg:p-6 ${theme.page}`}>
                  <div className={`mb-4 flex items-center justify-between gap-4 border-b pb-4 ${theme.line}`}>
                    <div>
                      <p className={`text-[10px] uppercase tracking-[0.4em] ${theme.label}`}>Pagina izquierda</p>
                      <h2 className={`mt-2 text-2xl font-semibold ${theme.title}`}>Identidad y navegacion</h2>
                    </div>
                    <div
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${theme.chip}`}
                    >
                      Interior
                    </div>
                  </div>

                  <PassportIdPage theme={theme} />

                  <div className={`mt-5 rounded-[24px] p-5 shadow-none ${theme.mutedCard}`}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className={`text-[10px] uppercase tracking-[0.35em] ${theme.label}`}>Busqueda migratoria</p>
                        <h3 className={`mt-2 text-lg font-semibold ${theme.title}`}>Buscar visas o destinos</h3>
                      </div>
                      <div className="w-full md:w-[280px]">
                        <div className="relative">
                          <Search
                            className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${theme.label}`}
                          />
                          <input
                            value={query}
                            onChange={event => setQuery(event.target.value)}
                            placeholder="Ciudad, evento o acceso"
                            className={`w-full rounded-[16px] pl-10 ${theme.input}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`rounded-[28px] border p-5 lg:p-6 ${theme.page}`}>
                  <div className={`mb-4 flex items-center justify-between gap-4 border-b pb-4 ${theme.line}`}>
                    <div>
                      <p className={`text-[10px] uppercase tracking-[0.4em] ${theme.label}`}>Pagina derecha</p>
                      <h2 className={`mt-2 text-2xl font-semibold ${theme.title}`}>Visas y sellos</h2>
                    </div>
                    <div
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${theme.chip}`}
                    >
                      Activa
                    </div>
                  </div>

                  <div className="space-y-5">
                    <FullPageVisa event={selectedEvent} theme={theme} />

                    <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
                      <div className="space-y-3">
                        {filteredEvents.map(event => (
                          <div key={event.id} onClick={() => setSelectedId(event.id)}>
                            <VisaTicket event={event} selected={event.id === selectedId} theme={theme} />
                          </div>
                        ))}
                      </div>

                      <StampSheet theme={theme} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
