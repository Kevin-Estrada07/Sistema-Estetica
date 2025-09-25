import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const generatePDF = (venta) => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text("Ticket de Venta", 14, 15);

    doc.setFontSize(11);
    doc.text(`Cliente: ${venta.cliente?.nombre || "-"}`, 14, 25);
    doc.text(`Usuario: ${venta.usuario?.name || "-"}`, 14, 32);
    doc.text(`Método de pago: ${venta.metodo_pago || "-"}`, 14, 39);

    // Si hay cita, mostrar ID
    if (venta.cita_id) {
        doc.text(`Cita ID: ${venta.cita_id}`, 14, 46);
    }

    // Formatear fecha a algo más legible
    const fecha = venta.fecha ? new Date(venta.fecha) : new Date();
    const fechaFormateada = fecha.toLocaleString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    doc.text(`Fecha: ${fechaFormateada}`, 14, venta.cita_id ? 53 : 46);

    // Crear filas de detalles
    const rows = (venta.detalles || []).map((d) => [
        d.nombre || d.servicio?.nombre || d.producto?.nombre || "-",
        Number(d.cantidad || 0),
        `$${Number(d.precio_unitario || 0).toFixed(2)}`,
        `$${Number(d.subtotal || 0).toFixed(2)}`
    ]);

    autoTable(doc, {
        head: [["Concepto", "Cantidad", "Precio", "Subtotal"]],
        body: rows,
        startY: venta.cita_id ? 60 : 55,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
    });

    // Total
    const finalY = doc.lastAutoTable?.finalY || (venta.cita_id ? 60 : 55);
    doc.setFontSize(12);
    doc.text(`TOTAL: $${Number(venta.total || 0).toFixed(2)}`, 14, finalY + 10);

    // Guardar PDF con ID o timestamp

    const tipo = venta.cita_id ? "cita" : "directa";
    doc.save(`ticket_venta_${tipo}_${venta.id}.pdf`);

    // doc.save(`ticket_venta_${venta.id || Date.now()}.pdf`);
};

export default generatePDF;
