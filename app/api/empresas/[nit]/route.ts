// app/api/empresas/[nit]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";

// Configuración de Azure Storage
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const AZURE_STORAGE_SAS_TOKEN = process.env.AZURE_STORAGE_SAS_TOKEN;
const CONTAINER_NAME = "certificadostributarios";

// Crear instancia del cliente de blobs
const blobServiceClient = new BlobServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net?${AZURE_STORAGE_SAS_TOKEN}`,
);

interface DocumentData {
  nombre: string;
  url: string;
  tamaño: number;
  tipo: string;
  fecha_creacion?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nit: string }> },
) {
  try {
    const { nit } = await params;

    console.log(nit);

    // Validar NIT
    if (!nit || !/^\d{8,11}$/.test(nit)) {
      return NextResponse.json(
        { error: "NIT inválido. Debe contener entre 8 y 11 dígitos." },
        { status: 400 },
      );
    }

    // Verificar configuración de Azure
    if (!AZURE_STORAGE_ACCOUNT_NAME || !AZURE_STORAGE_SAS_TOKEN) {
      console.error("❌ Variables de entorno de Azure no configuradas");
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 },
      );
    }

    const containerClient =
      blobServiceClient.getContainerClient(CONTAINER_NAME);
    const archivos: DocumentData[] = [];

    console.log(`📂 Buscando archivos en: ${CONTAINER_NAME}/${nit}`);

    // Listar blobs en el contenedor
    for await (const blob of containerClient.listBlobsFlat()) {
      console.log(`Archivo encontrado: ${blob.name}`);

      // Filtrar solo archivos dentro del directorio del NIT
      if (blob.name.startsWith(`${nit}/`)) {
        archivos.push({
          nombre: blob.name.replace(`${nit}/`, ""), // Quita el prefijo del directorio
          url: `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blob.name}?${AZURE_STORAGE_SAS_TOKEN}`,
          tamaño: blob.properties.contentLength || 0,
          tipo: blob.properties.contentType || "application/octet-stream",
          fecha_creacion: blob.properties.createdOn?.toISOString(),
        });
      }
    }

    if (archivos.length === 0) {
      return NextResponse.json(
        {
          mensaje: `No se encontraron documentos para el NIT ${nit}`,
          nit,
          documentos: [],
        },
        { status: 404 },
      );
    }

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      nit,
      documentos: archivos,
      total: archivos.length,
      mensaje: `Se encontraron ${archivos.length} documento(s) para el NIT ${nit}`,
    });
  } catch (error: any) {
    console.error("❌ Error al listar documentos:", error);

    // Manejar diferentes tipos de errores
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return NextResponse.json(
        { error: "No se pudo conectar con Azure Storage" },
        { status: 503 },
      );
    }

    if (error.statusCode === 403) {
      return NextResponse.json(
        { error: "Sin permisos para acceder al almacenamiento" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        error: "Error interno del servidor al obtener los documentos",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
