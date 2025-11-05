import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  FileSpreadsheet,
  Lightbulb,
  Users,
  PackageSearch,
  RotateCcw
} from "lucide-react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default function Dashboard() {
  const [articoli, setArticoli] = useState([]);
  const [personale, setPersonale] = useState([]);
  const [assegnazioni, setAssegnazioni] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: art } = await supabase.from("articoli").select("*");
    const { data: pers } = await supabase.from("personale").select("*");
    const { data: assegn } = await supabase.from("assegnazioni").select("*");
    setArticoli(art || []);
    setPersonale(pers || []);
    setAssegnazioni(assegn || []);
  }

  const quantitaPerTipo = articoli.reduce((acc, a) => {
    acc[a.tipo] = (acc[a.tipo] || 0) + a.quantita;
    return acc;
  }, {});

  const chartData = Object.keys(quantitaPerTipo).map((key) => ({
    tipo: key,
    quantita: quantitaPerTipo[key],
  }));

  const assegnazioniCount = assegnazioni.reduce((acc, a) => {
    acc[a.nome_capo] = (acc[a.nome_capo] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(assegnazioniCount).map((key) => ({
    name: key,
    value: assegnazioniCount[key],
  }));

  const colori = ["#b30e0e", "#e83c3c", "#8b8b8b", "#ff6961", "#9d0d0d"];

  const articoliTotali = articoli.length;
  const personaleTotale = personale.length;
  const scorteCritiche = articoli.filter((a) => a.quantita <= 5).length;
  const valoreTotale = articoli.reduce(
    (acc, a) => acc + (a.valore || 0) * a.quantita,
    0
  );

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(articoli);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "inventario_medipower.xlsx");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b bg-white shadow-sm">
        <img src="/medipower-logo.png" alt="Medipower Logo" className="h-10" />
        <h1 className="text-xl font-semibold text-[#b30e0e]">
          MP Vestiario Pro{" "}
          <span className="text-gray-500 text-sm">
            — powered by Medipower
          </span>
        </h1>
        <span className="text-sm text-[#b30e0e] font-bold bg-[#ffe6e6] px-3 py-1 rounded-full shadow-sm">
          Live Dashboard
        </span>
      </div>

      {/* CARD PRINCIPALI */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Articoli totali"
          value={articoliTotali}
          icon={<PackageSearch />}
          desc="Tutte le tipologie presenti"
        />
        <Card
          title="Personale"
          value={personaleTotale}
          icon={<Users />}
          desc="Dipendenti censiti"
        />
        <Card
          title="Da riordinare"
          value={scorteCritiche}
          icon={<RotateCcw />}
          desc="Scorta ≤ 5"
        />
      </div>

      {/* GRAFICI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4 text-[#b30e0e]">
            📊 Quantità per tipo
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="tipo" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantita" fill="#b30e0e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4 text-[#b30e0e]">
            🥧 Capi più assegnati
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colori[index % colori.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* VALORE TOTALE */}
      <div className="mt-8 px-6 text-center">
        <p className="text-lg font-semibold mb-2">
          💰 Valore totale magazzino:{" "}
          <span className="text-[#b30e0e]">
            € {valoreTotale.toLocaleString("it-IT")}
          </span>
        </p>
        <button
          onClick={handleDownload}
          className="bg-[#b30e0e] hover:bg-[#8b0c0c] text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all"
        >
          <FileSpreadsheet className="inline-block w-4 h-4 mr-2" />
          Scarica inventario Excel
        </button>
      </div>

      {/* SUGGERIMENTI */}
      <div className="mt-10 px-6 pb-10">
        <div className="bg-white rounded-xl shadow-md p-5">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-[#b30e0e]">
            <Lightbulb /> Suggerimenti automatici
          </h2>
          {scorteCritiche > 0 ? (
            <p className="text-[#b30e0e] font-medium">
              ⚠️ Alcuni articoli sono sotto scorta. Valuta un riordino
              immediato.
            </p>
          ) : (
            <p className="text-green-600 font-medium">
              ✅ Tutto sotto controllo. Nessun articolo sotto scorta.
            </p>
          )}
        </div>
      </div>

      <footer className="text-center text-sm text-gray-500 pb-4">
        MP Vestiario © {new Date().getFullYear()} — by Medipower
      </footer>
    </div>
  );
}

function Card({ title, value, icon, desc }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center">
      <div className="text-[#b30e0e] mb-2">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-3xl font-bold text-[#b30e0e]">{value}</p>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}
