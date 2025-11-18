import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import html2canvas from "html2canvas";

pdfMake.vfs = pdfFonts.vfs;

export const ReportPDF = async (data, { inicio, fin }) => {
    // 1. Capturar gráficos como imágenes
    const chartIngresos = await captureChart("#chart-ingresos");
    const chartCitas = await captureChart("#chart-citas");
    const chartServicios = await captureChart("#chart-servicios");

    const docDefinition = {
        content: [
            { text: "Reporte de Ingresos y Citas", style: "header" },
            { text: `Rango de fechas: ${inicio} — ${fin}`, style: "subheader" },

            // Cards resumen
            {
                columns: [
                    { text: `Ingresos: $${data.totalIngresos}`, style: "card" },
                    { text: `Total Citas: ${data.totalCitas}`, style: "card" },
                    { text: `Canceladas: ${data.canceladas}`, style: "card" },
                ],
                columnGap: 20,
                margin: [0, 10],
            },

            // Tabla de últimas citas
            { text: "Últimas Citas", style: "sectionHeader" },
            {
                table: {
                    headerRows: 1,
                    widths: ["auto", "*", "*", "*", "auto", "auto", "auto"],
                    body: [
                        [
                            { text: "#", style: "tableHeader" },
                            { text: "Cliente", style: "tableHeader" },
                            { text: "Servicio", style: "tableHeader" },
                            { text: "Empleado", style: "tableHeader" },
                            { text: "Fecha", style: "tableHeader" },
                            { text: "Estado", style: "tableHeader" },
                            { text: "Precio", style: "tableHeader" },
                        ],
                        ...[...data.DetalleCitas] // copiamos para no mutar el original
                            .sort((a, b) => a.id - b.id) // 🔹 orden ascendente
                            .map((c) => [
                                c.id,
                                c.clientes,
                                c.servicios,
                                c.users,
                                c.fecha,
                                { text: c.estado, color: c.estado === "cancelada" ? "red" : "green" },
                                `$${c.servicio_precio}`,
                            ]),
                    ],
                },
                layout: "lightHorizontalLines",
                margin: [0, 10, 0, 20],
            },


            // Gráficas
            {
                text: "Gráficas Comparativas",
                style: "sectionHeader",
                margin: [0, 10, 0, 10],
            },
            {
                columns: [
                    [
                        { text: "Ingresos por Día", style: "miniHeader", alignment: "center" },
                        chartIngresos
                            ? { image: chartIngresos, width: 150, margin: [0, 10], alignment: "left" }
                            : {},
                    ],
                    [
                        { text: "Citas por Día", style: "miniHeader", alignment: "center" },
                        chartCitas
                            ? { image: chartCitas, width: 150, margin: [0, 10], alignment: "center" }
                            : {},
                    ],
                    [
                        { text: "Ingresos por Servicio", style: "miniHeader", alignment: "center" },
                        chartServicios
                            ? { image: chartServicios, width: 150, margin: [0, 10], alignment: "right" }
                            : {},
                    ],
                ],
                columnGap: 10,
            },

            // Top Servicios y Estilistas
            { text: "Top Servicios", style: "sectionHeader", pageBreak: "before" },
            {
                table: {
                    headerRows: 1,
                    widths: ["*", "auto", "auto"],
                    body: [
                        [
                            { text: "Servicio", style: "tableHeader" },
                            { text: "Citas", style: "tableHeader" },
                            { text: "Monto", style: "tableHeader" },
                        ],
                        ...(data.topServicios || []).map((s) => [
                            s.nombre,
                            s.total_citas,
                            `$${parseFloat(s.monto_total).toFixed(2)}`,
                        ]),
                    ],
                },
                layout: "lightHorizontalLines",
                margin: [0, 10, 0, 20],
            },

            { text: "⭐ Top Estilistas", style: "sectionHeader" },
            {
                table: {
                    headerRows: 1,
                    widths: ["*", "auto", "auto"],
                    body: [
                        [
                            { text: "Estilista", style: "tableHeader" },
                            { text: "Citas", style: "tableHeader" },
                            { text: "Monto", style: "tableHeader" },
                        ],
                        ...(data.topEstilistas || []).map((e) => [
                            e.name,
                            e.total_citas,
                            `$${parseFloat(e.monto_total).toFixed(2)}`,
                        ]),
                    ],
                },
                layout: "lightHorizontalLines",
                margin: [0, 10, 0, 20],
            },

            // Inventario - Productos con Rotación
            { text: "Productos con Rotación", style: "sectionHeader", pageBreak: "before" },
            {
                table: {
                    headerRows: 1,
                    widths: ["*", "auto", "auto", "auto"],
                    body: [
                        [
                            { text: "Producto", style: "tableHeader" },
                            { text: "Stock", style: "tableHeader" },
                            { text: "Cantidad Usada", style: "tableHeader" },
                            { text: "Servicios", style: "tableHeader" },
                        ],
                        ...(data.productosRotacion || []).map((p) => [
                            p.nombre,
                            p.stock,
                            p.cantidad_usada,
                            p.servicios_asociados,
                        ]),
                    ],
                },
                layout: "lightHorizontalLines",
                margin: [0, 10, 0, 20],
            },

            // Productos Bajo Stock
            { text: "Productos Bajo Stock", style: "sectionHeader" },
            {
                table: {
                    headerRows: 1,
                    widths: ["*", "auto", "auto", "auto"],
                    body: [
                        [
                            { text: "Producto", style: "tableHeader" },
                            { text: "Stock", style: "tableHeader" },
                            { text: "Precio", style: "tableHeader" },
                            { text: "Valor Total", style: "tableHeader" },
                        ],
                        ...(data.productosBajoStock || []).map((p) => [
                            p.nombre,
                            { text: p.stock, color: "red", bold: true },
                            `$${parseFloat(p.precio).toFixed(2)}`,
                            `$${parseFloat(p.valor_total).toFixed(2)}`,
                        ]),
                    ],
                },
                layout: "lightHorizontalLines",
                margin: [0, 10, 0, 20],
            },

            // Totales
            {
                text: `TOTAL GENERAL: $${data.totalIngresos}`,
                style: "total",
                alignment: "right",
                margin: [0, 10],
            },
        ],
        styles: {
            header: { fontSize: 20, bold: true, alignment: "center", margin: [0, 0, 0, 10] },

            miniHeader: { fontSize: 10, bold: true, margin: [0, 0, 0, 5] },

            subheader: { fontSize: 12, alignment: "center", margin: [0, 0, 0, 20] },
            card: { fontSize: 12, bold: true },
            sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 10] },
            tableHeader: { bold: true, fillColor: "#f3f4f6" },
            total: { bold: true, fontSize: 14 },
        },
    };

    pdfMake.createPdf(docDefinition).open();
};

// 🔹 Función para capturar gráficos como imagen base64
async function captureChart(selector) {
    const svg = document.querySelector(`${selector} svg`);
    if (!svg) return null;

    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const image64 = "data:image/svg+xml;base64," + svg64;

    // Convertir el SVG a canvas para pdfmake
    const img = new Image();
    img.src = image64;
    await new Promise(res => (img.onload = res));

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; // Fondo blanco
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    return canvas.toDataURL("image/png");
}

