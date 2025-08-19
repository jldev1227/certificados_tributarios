"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  FileCheck,
  Shield,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function Home() {
  const [nit, setNit] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleNitChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNit(value);
    if (error) setError(""); // Limpiar error al escribir
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (nit.trim() === "") {
      setError("El NIT de tu empresa es requerido");
      return;
    }

    if (nit.length < 8) {
      setError("El NIT debe tener al menos 8 dígitos");
      return;
    }

    setIsLoading(true);

    // Simular delay de navegación
    setTimeout(() => {
      router.push(`/certificados/${nit}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-emerald-400 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 lg:p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-emerald-700">
                Certificados Transmeralda
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-emerald-600">
              <Shield className="w-4 h-4" />
              <span>Plataforma Segura</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 container mx-auto max-w-6xl px-4 lg:px-6">
        <div className="min-h-[calc(100vh-160px)] flex items-center">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
            {/* Content Side */}
            <div className="space-y-8 lg:pr-8">
              {/* Hero Text */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
                    <Building2 className="w-4 h-4" />
                    Portal Empresarial
                  </div>

                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    ¡Bienvenido!
                    <span className="block text-emerald-600">a tu portal</span>
                  </h1>

                  <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                    Consulta y gestiona todos tus certificados empresariales de
                    forma
                    <span className="text-emerald-600 font-semibold">
                      {" "}
                      rápida y segura
                    </span>
                  </p>
                </div>

                {/* Features */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-emerald-100">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Certificados
                      </h3>
                      <p className="text-sm text-gray-600">Acceso inmediato</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-emerald-100">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Seguridad</h3>
                      <p className="text-sm text-gray-600">Datos protegidos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white/80 backdrop-blur-lg p-6 lg:p-8 rounded-2xl shadow-xl border border-white/20">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      NIT de tu empresa
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={nit}
                        onChange={handleNitChange}
                        placeholder="Ingresa el NIT de tu empresa"
                        className={`
                          w-full pl-12 pr-4 py-4 text-lg rounded-xl border-2 transition-all duration-200
                          focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none
                          ${
                            error
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200 bg-white hover:border-emerald-300"
                          }
                        `}
                        min={0}
                        step={1}
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="
                      w-full bg-gradient-to-r from-emerald-600 to-green-600 
                      hover:from-emerald-700 hover:to-green-700 
                      disabled:from-gray-400 disabled:to-gray-500
                      text-white font-semibold py-4 px-6 rounded-xl
                      transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                      shadow-lg hover:shadow-xl
                      flex items-center justify-center gap-3
                      disabled:cursor-not-allowed disabled:transform-none
                    "
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Consultando...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">Ver certificados</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                {/* Info adicional */}
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-sm text-emerald-700 text-center">
                    💡 <strong>Tip:</strong> Ingresa el NIT sin puntos ni
                    guiones, ni dígito de verificación, solo números
                  </p>
                </div>
              </div>
            </div>

            {/* Image Side */}
            <div className="hidden lg:flex justify-center items-center lg:justify-end order-first lg:order-last">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-200 rounded-full blur-xl opacity-60"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-green-200 rounded-full blur-xl opacity-60"></div>

                {/* Main image container */}
                <div className="relative bg-gradient-to-br from-emerald-100 to-green-100 rounded-3xl p-8 lg:p-12 shadow-2xl">
                  <Image
                    src="/assets/codi.png"
                    width={400}
                    height={400}
                    alt="Cody - Mascota de Transmeralda"
                    className="w-[280px] h-[320px] lg:w-[350px] lg:h-[400px] object-contain drop-shadow-2xl"
                    priority
                  />

                  {/* Floating badge */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg">
                    <FileCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-10 relative z-10 p-4 lg:p-6 border-t border-emerald-100 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-center sm:text-left text-gray-600">
              © 2025 Certificados Transmeralda. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
