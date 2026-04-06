"use client";

import { useState } from "react";
import Link from "next/link";

type Rol = "presidente" | "vicepresidente-1" | "vicepresidente-2" | "congresista" | "otro";

const ROL_OPTIONS: { value: Rol; label: string }[] = [
  { value: "presidente", label: "Presidente" },
  { value: "vicepresidente-1", label: "Vicepresidente 1" },
  { value: "vicepresidente-2", label: "Vicepresidente 2" },
  { value: "congresista", label: "Congresista" },
  { value: "otro", label: "Otro" },
];

interface FormData {
  nombre: string;
  foto: string;
  partido: string;
  rol: Rol;
  cargo: string;
}

export default function RegistrarEntidadPage() {
  const [form, setForm] = useState<FormData>({
    nombre: "",
    foto: "",
    partido: "",
    rol: "presidente",
    cargo: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/entidad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          foto: form.foto.trim() || "/img/entidades/placeholder.png",
          tipo: "persona",
          rol: form.rol,
          partido: form.partido.trim() || undefined,
          cargo: form.cargo.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Error ${res.status}`);
      }

      const data = await res.json();
      setCreatedId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar.");
    } finally {
      setSubmitting(false);
    }
  }

  if (createdId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <div className="text-4xl mb-3 text-emerald-600">&#10003;</div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">
          Candidato registrado
        </h1>
        <p className="text-zinc-400 mb-6">
          <strong>{form.nombre}</strong> fue registrado como {ROL_OPTIONS.find(r => r.value === form.rol)?.label?.toLowerCase()}
          {form.partido ? ` de ${form.partido}` : ""}.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href={`/entidad/${createdId}`}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            Ver perfil
          </Link>
          <button
            onClick={() => {
              setCreatedId(null);
              setForm({ nombre: "", foto: "", partido: form.partido, rol: form.rol, cargo: "" });
            }}
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Registrar otro
          </button>
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        &larr; Volver al inicio
      </Link>

      <h1 className="text-2xl font-bold text-zinc-100 mb-2">
        Registrar candidato
      </h1>
      <p className="text-zinc-400 mb-8">
        Agrega un candidato para evaluar su razonamiento moral con la escala de Kohlberg.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-zinc-300 mb-1">
            Nombre completo *
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre y apellidos"
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Partido y Rol en fila */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="partido" className="block text-sm font-medium text-zinc-300 mb-1">
              Partido pol&iacute;tico
            </label>
            <input
              id="partido"
              name="partido"
              type="text"
              value={form.partido}
              onChange={handleChange}
              placeholder="Nombre del partido"
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="rol" className="block text-sm font-medium text-zinc-300 mb-1">
              Rol en f&oacute;rmula
            </label>
            <select
              id="rol"
              name="rol"
              value={form.rol}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ROL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Foto */}
        <div>
          <label htmlFor="foto" className="block text-sm font-medium text-zinc-300 mb-1">
            URL de foto
          </label>
          <input
            id="foto"
            name="foto"
            type="text"
            value={form.foto}
            onChange={handleChange}
            placeholder="https://ejemplo.com/foto.jpg"
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-zinc-400">Opcional. Se usar&aacute; un placeholder si no se especifica.</p>
        </div>

        {/* Cargo */}
        <div>
          <label htmlFor="cargo" className="block text-sm font-medium text-zinc-300 mb-1">
            Cargo actual (opcional)
          </label>
          <input
            id="cargo"
            name="cargo"
            type="text"
            value={form.cargo}
            onChange={handleChange}
            placeholder="Cargo o actividad actual"
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-white py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-50"
        >
          {submitting ? "Registrando..." : "Registrar candidato"}
        </button>
      </form>
    </div>
  );
}
