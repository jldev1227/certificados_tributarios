"use client";

import Image from "next/image";
import { useState, useEffect, use } from "react";
import {
  FileText,
  ExternalLink,
  Building2,
  FileX,
  ArrowLeft,
  Shield,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Wifi,
  Server,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

// Tipos para mejor tipado
interface Document {
  nombre: string;
  url: string;
  fecha_creacion?: string;
  tipo?: string;
  tamaño?: string;
}

interface CompanyData {
  documentos: Document[];
  nombre_empresa?: string;
  estado?: string;
  error?: {
    type:
      | "not_found"
      | "server_error"
      | "network_error"
      | "invalid_nit"
      | "config_error";
    message: string;
    details?: string;
  };
}

function getErrorType(
  status: number,
):
  | "not_found"
  | "server_error"
  | "network_error"
  | "invalid_nit"
  | "config_error" {
  switch (status) {
    case 400:
      return "invalid_nit";
    case 404:
      return "not_found";
    case 500:
    case 503:
      return "server_error";
    case 403:
      return "config_error";
    default:
      return "server_error";
  }
}

// ✅ FUNCIÓN MOVIDA FUERA DEL COMPONENTE
async function fetchDocuments(nit: string): Promise<CompanyData> {
  try {
    const apiUrl = `/api/empresas/${nit}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error(`❌ Respuesta no es JSON. Content-Type: ${contentType}`);

      return {
        documentos: [],
        error: {
          type: "server_error",
          message: "Error del servidor",
          details:
            "El servidor no respondió con JSON válido. Verifica que la API Route esté configurada correctamente.",
        },
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        documentos: [],
        error: {
          type: getErrorType(response.status),
          message: data.error || `Error HTTP ${response.status}`,
          details:
            data.details || `La API respondió con código ${response.status}`,
        },
      };
    }

    if (!data.success) {
      return {
        documentos: [],
        error: {
          type: "server_error",
          message: data.error || "Error del servidor",
          details: data.details || "La API retornó success: false",
        },
      };
    }

    return {
      documentos: data.documentos || [],
      nombre_empresa: data.nombre_empresa,
      estado: data.estado,
    };
  } catch (error: any) {
    console.error("❌ Error al consultar API Route:", error);

    if (error.name === "SyntaxError" && error.message.includes("JSON")) {
      return {
        documentos: [],
        error: {
          type: "server_error",
          message: "Error de configuración",
          details: "El servidor retornó HTML en lugar de JSON.",
        },
      };
    }

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return {
        documentos: [],
        error: {
          type: "network_error",
          message: "Error de conexión",
          details: "No se pudo conectar con el servidor.",
        },
      };
    }

    return {
      documentos: [],
      error: {
        type: "server_error",
        message: "Error del sistema",
        details: `Error interno: ${error.message || "Error desconocido"}`,
      },
    };
  }
}

// Componente para el skeleton de carga
function DocumentsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ✅ Componente para manejo de errores
function ErrorState({
  error,
  nit,
  onRetry,
}: {
  error: CompanyData["error"];
  nit: string;
  onRetry: () => void;
}) {
  if (!error) return null;

  const getErrorIcon = (type: string) => {
    switch (type) {
      case "not_found":
        return FileX;
      case "network_error":
        return Wifi;
      case "server_error":
        return Server;
      case "invalid_nit":
        return AlertTriangle;
      case "config_error":
        return HelpCircle;
      default:
        return HelpCircle;
    }
  };

  const getErrorColor = (type: string) => {
    switch (type) {
      case "not_found":
        return "orange";
      case "network_error":
        return "blue";
      case "server_error":
        return "red";
      case "invalid_nit":
        return "yellow";
      case "config_error":
        return "purple";
      default:
        return "gray";
    }
  };

  const color = getErrorColor(error.type);
  const IconComponent = getErrorIcon(error.type);

  return (
    <div className="text-center py-12">
      <div
        className={`w-32 h-32 mx-auto mb-6 bg-${color}-50 rounded-full flex items-center justify-center relative overflow-hidden`}
      >
        {error.type === "network_error" && (
          <div className="absolute inset-0">
            <div
              className={`absolute inset-4 bg-${color}-100 rounded-full animate-ping`}
            ></div>
            <div
              className={`absolute inset-8 bg-${color}-200 rounded-full animate-ping`}
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>
        )}

        <IconComponent
          className={`w-16 h-16 text-${color}-500 relative z-10`}
        />

        {(error.type === "server_error" ||
          error.type === "network_error" ||
          error.type === "config_error") && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">!</span>
          </div>
        )}
      </div>

      <h3 className={`text-2xl font-bold text-${color}-600 mb-3`}>
        {error.message}
      </h3>

      <div
        className={`max-w-lg mx-auto mb-8 p-4 bg-${color}-50 rounded-xl border border-${color}-200`}
      >
        <p className={`text-${color}-700 text-sm leading-relaxed mb-3`}>
          {error.details}
        </p>
      </div>

      {/* ✅ Botones de acción con handlers */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {error.type === "not_found" || error.type === "invalid_nit" ? (
          <Link
            href="/"
            className={`inline-flex items-center gap-2 px-6 py-3 bg-${color}-600 text-white rounded-xl hover:bg-${color}-700 transition-all duration-200`}
          >
            <ArrowLeft className="w-4 h-4" />
            Consultar otro NIT
          </Link>
        ) : (
          <button
            onClick={onRetry}
            className={`inline-flex items-center gap-2 px-6 py-3 bg-${color}-600 text-white rounded-xl hover:bg-${color}-700 transition-all duration-200`}
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        )}

        <Link
          href="/"
          className={`inline-flex items-center gap-2 px-6 py-3 border border-${color}-600 text-${color}-600 rounded-xl hover:bg-${color}-50 transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}

// Componente para cada documento
function DocumentCard({ doc, index }: { doc: Document; index: number }) {
  const formatFileSize = (size?: string | number) => {
    if (!size) return "Tamaño desconocido";
    const sizeInBytes = typeof size === "string" ? parseInt(size, 10) : size;
    if (isNaN(sizeInBytes) || sizeInBytes <= 0) return "Tamaño no válido";

    const KB = 1024;
    const MB = KB * 1024;
    const GB = MB * 1024;

    if (sizeInBytes >= GB) {
      return `${(sizeInBytes / GB).toFixed(2)} GB`;
    } else if (sizeInBytes >= MB) {
      return `${(sizeInBytes / MB).toFixed(2)} MB`;
    } else if (sizeInBytes >= KB) {
      return `${(sizeInBytes / KB).toFixed(2)} KB`;
    } else {
      return `${sizeInBytes} Bytes`;
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "Fecha no disponible";
    return new Date(date).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "/assets/pdf.svg";
      case "doc":
      case "docx":
        return "/assets/docx.svg";
      case "xls":
      case "xlsx":
        return "/assets/xlsx.svg";
      default:
        return "/assets/file.svg";
    }
  };

  return (
    <div className="group bg-white border border-gray-200 hover:border-emerald-300 rounded-xl p-4 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <img
              src={getFileIcon(doc.nombre)}
              width={32}
              height={32}
              className="w-8 h-8"
              alt="Icono de archivo"
            />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">{index + 1}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
            {doc.nombre}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
            {doc.fecha_creacion && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(doc.fecha_creacion)}</span>
              </div>
            )}
            {doc.tamaño && (
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>{formatFileSize(doc.tamaño)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors"
            title="Abrir en nueva pestaña"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

// Componente para el estado vacío
function EmptyState({ nit, onRetry }: { nit: string; onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <FileX className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        No hay documentos disponibles
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        No se encontraron certificados para el NIT{" "}
        <strong>{nit}</strong>.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Consultar otro NIT
        </Link>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 border border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar página
        </button>
      </div>
    </div>
  );
}

// ✅ COMPONENTE PRINCIPAL CORREGIDO - SIN ASYNC
export default function DocumentsPage({
  params,
}: {
  params: Promise<{ nit: string }>;
}) {
  // ✅ Type assertion
  const resolvedParams = use(params) as { nit: string };

  const [companyData, setCompanyData] = useState<CompanyData>({
    documentos: [],
  });
  const [loading, setLoading] = useState(true);
  const [nit] = useState(resolvedParams.nit);

  // ✅ Función para cargar datos
  const loadData = async () => {
    try {
      setLoading(true);

      const result = await fetchDocuments(nit);
      setCompanyData(result);
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
      setCompanyData({
        documentos: [],
        error: {
          type: "server_error",
          message: "Error del sistema",
          details: "Error inesperado al cargar los datos",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ useEffect para cargar datos una sola vez
  useEffect(() => {
    loadData();
  }, [nit]); // Solo se ejecuta cuando cambia el NIT

  // ✅ Función para retry
  const handleRetry = () => {
    loadData();
  };

  const { documentos, nombre_empresa, estado, error } = companyData;

  // ✅ Mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto mb-4" />
          <p className="text-emerald-700 font-medium">
            Cargando certificados...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Header Responsive */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-40">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header Móvil */}
          <div className="py-3 sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <Link
                href="/"
                className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Volver al inicio"
              >
                <ArrowLeft className="w-5 h-5 text-emerald-600" />
              </Link>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Certificados
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <Shield className="w-3 h-3" />
                <span className="hidden xs:inline">Verificado</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Documentos oficiales y certificaciones
            </p>
          </div>

          {/* Header Tablet y Desktop */}
          <div className="hidden sm:block py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Volver al inicio"
                >
                  <ArrowLeft className="w-5 h-5 text-emerald-600" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                      Certificados Tributarios
                    </h1>
                    <p className="text-sm text-gray-500">
                      Documentos oficiales y certificaciones
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <Shield className="w-4 h-4" />
                <span>Documentos Verificados</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Responsive */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Si hay error */}
        {error ? (
          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
            {/* Sidebar con mascota - Error */}
            <div className="lg:col-span-4 lg:order-2">
              <div className="lg:sticky lg:top-24">
                <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl p-4 sm:p-6 lg:p-8 text-center shadow-lg">
                  <Image
                    src="/assets/codi.png"
                    width={280}
                    height={300}
                    alt="Cody - Mascota"
                    className="mx-auto grayscale"
                    priority
                  />
                  <h3 className="text-base sm:text-lg font-semibold text-red-700 mb-2">
                    ¡Ups! Algo salió mal
                  </h3>
                  <p className="text-red-600 text-xs sm:text-sm">
                    No te preocupes, estamos aquí para ayudarte
                  </p>
                </div>
              </div>
            </div>

            {/* Error Content */}
            <div className="lg:col-span-8 lg:order-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-red-100 shadow-lg">
                <ErrorState error={error} nit={nit} onRetry={handleRetry} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
            {/* Sidebar con mascota - Éxito */}
            <div className="lg:col-span-4 lg:order-2">
              <div className="lg:sticky lg:top-24">
                <div className="bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl p-4 sm:p-6 lg:p-8 text-center shadow-lg">
                  <Image
                    src="/assets/codi.png"
                    width={400}
                    height={300}
                    alt="Cody - Mascota"
                    className="mx-auto"
                    priority
                  />
                  <h3 className="text-base sm:text-lg font-semibold text-emerald-700 mb-2">
                    {documentos.length > 0
                      ? "¡Documentos Listos!"
                      : "¿Sin documentos?"}
                  </h3>
                  <p className="text-emerald-600 text-xs sm:text-sm leading-relaxed">
                    {documentos.length > 0
                      ? "Todos tus certificados están disponibles"
                      : "No se encontraron documentos para esta empresa"}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-8 lg:order-1 space-y-4 sm:space-y-6">
              {/* Info de la empresa */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
                <div className="flex flex-row items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-1 break-words">
                      {nombre_empresa || `NIT: ${nit}`}
                    </h2>
                    <div className="flex flex-col xs:flex-row xs:flex-wrap items-start xs:items-center gap-2 xs:gap-4 text-sm text-gray-600">
                      {estado && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Estado:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              estado === "activo"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {estado}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de documentos */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Certificados Disponibles
                  </h3>
                  {documentos.length > 0 && (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium self-start sm:self-auto">
                      {documentos.length} documento
                      {documentos.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {documentos.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {documentos.map((doc, index) => (
                      <DocumentCard key={index} doc={doc} index={index} />
                    ))}
                  </div>
                ) : (
                  <EmptyState nit={nit} onRetry={handleRetry} />
                )}
              </div>

              {/* Información adicional */}
              {documentos.length > 0 && (
                <div className="p-3 sm:p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 sm:mt-0.5" />
                    <div className="text-sm text-emerald-700">
                      <p className="font-medium mb-1">Documentos Verificados</p>
                      <p className="leading-relaxed">
                        Todos los certificados mostrados son documentos
                        oficiales verificados.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-100 bg-white/50 backdrop-blur-sm mt-8 sm:mt-12">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-4 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-gray-600">
              © 2025 Certificados Transmeralda. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <span>Soporte técnico</span>
              <span>•</span>
              <span>Datos protegidos</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
