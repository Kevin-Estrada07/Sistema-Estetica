import jsPDF from "jspdf";

const generatePDF = (venta) => {
  if (!venta) {
    console.error("❌ No se proporcionó una venta válida para generar el PDF");
    return;
  }

  // 📄 Formato ticket (ancho 80 mm ≈ 80 / 25.4 = 3.15 pulgadas)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 200], // ancho x alto inicial
  });

  let y = 10; // posición vertical inicial

  // 🧾 Encabezado
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Estética “Tu Belleza”", 40, y, { align: "center" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const fecha = venta.fecha ? new Date(venta.fecha) : new Date();
  const fechaFormateada = fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  doc.text(`Fecha: ${fechaFormateada}`, 10, y);
  doc.text(`Venta #${venta.id}`, 65, y, { align: "right" });
  y += 6;

  doc.text(`Atendió: ${venta.usuario?.name || "-"}`, 10, y);
  y += 5;
  doc.text(`Cliente: ${venta.cliente?.nombre || "Invitado"}`, 10, y);
  y += 7;

  // Verificar si la venta fue reembolsada
  const reembolsoAprobado = venta.reembolsos?.find(r => r.estado === 'aprobado');
  if (reembolsoAprobado) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(220, 53, 69); // Rojo
    doc.text("*** VENTA CANCELADA ***", 40, y, { align: "center" });
    y += 5;
    doc.text("*** REEMBOLSADA ***", 40, y, { align: "center" });
    y += 7;
    doc.setTextColor(0, 0, 0); // Volver a negro
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  }

  // -----------------------------
  doc.text("------------------------------", 10, y);
  y += 5;
  doc.text("Servicio / Producto       Precio", 10, y);
  y += 5;
  doc.text("------------------------------", 10, y);
  y += 6;

  // 💄 Contenido dinámico
  (venta.detalles || []).forEach((d) => {
    const nombre = d.servicio?.nombre || d.producto?.nombre || "—";
    const nombreCorto = nombre.length > 18 ? nombre.slice(0, 17) + "…" : nombre;
    const precio = `$${Number(d.subtotal || 0).toFixed(2)}`;

    doc.text(nombreCorto, 10, y);
    doc.text(precio, 70, y, { align: "right" });
    y += 6;
  });

  // -----------------------------
  doc.text("------------------------------", 10, y);
  y += 6;

  // 💰 Totales
  doc.setFont("helvetica", "normal");

  // Subtotal
  const subtotal = Number(venta.subtotal || 0);
  doc.text("Subtotal:", 10, y);
  doc.text(`$${subtotal.toFixed(2)}`, 70, y, { align: "right" });
  y += 5;

  // Descuento (si existe)
  const descuentoMonto = Number(venta.descuento_monto || 0);
  const descuentoPorcentaje = Number(venta.descuento_porcentaje || 0);
  if (descuentoMonto > 0) {
    const descuentoTexto = descuentoPorcentaje > 0
      ? `Descuento (${descuentoPorcentaje}%):`
      : "Descuento:";
    doc.text(descuentoTexto, 10, y);
    doc.text(`-$${descuentoMonto.toFixed(2)}`, 70, y, { align: "right" });
    y += 5;
  }

  // Impuesto (si existe)
  const impuestoMonto = Number(venta.impuesto_monto || 0);
  const impuestoPorcentaje = Number(venta.impuesto_porcentaje || 0);
  if (impuestoMonto > 0) {
    const impuestoTexto = impuestoPorcentaje > 0
      ? `Impuesto (${impuestoPorcentaje}%):`
      : "Impuesto:";
    doc.text(impuestoTexto, 10, y);
    doc.text(`+$${impuestoMonto.toFixed(2)}`, 70, y, { align: "right" });
    y += 5;
  }

  // Línea separadora antes del total
  doc.text("------------------------------", 10, y);
  y += 6;

  // Total
  doc.setFont("helvetica", "bold");
  if (reembolsoAprobado) {
    // Mostrar total original tachado y $0.00
    doc.text("Total original:", 10, y);
    doc.setTextColor(150, 150, 150); // Gris
    const totalOriginal = `$${Number(venta.total_original || venta.total || 0).toFixed(2)}`;
    doc.text(totalOriginal, 70, y, { align: "right" });
    // Línea de tachado
    const textWidth = doc.getTextWidth(totalOriginal);
    doc.line(70 - textWidth, y - 1, 70, y - 1);
    y += 5;

    doc.setTextColor(220, 53, 69); // Rojo
    doc.text("Total reembolsado:", 10, y);
    doc.text("$0.00", 70, y, { align: "right" });
    doc.setTextColor(0, 0, 0); // Volver a negro
  } else {
    doc.text("Total a pagar:", 10, y);
    doc.text(`$${Number(venta.total || 0).toFixed(2)}`, 70, y, { align: "right" });
  }
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text(`Método de pago: ${venta.metodo_pago || "-"}`, 10, y);
  y += 6;

  doc.text("------------------------------", 10, y);
  y += 6;

  // Información de reembolso si existe
  if (reembolsoAprobado) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("INFORMACIÓN DE REEMBOLSO:", 10, y);
    y += 5;

    const fechaReembolso = new Date(reembolsoAprobado.fecha_respuesta || reembolsoAprobado.fecha_solicitud);
    const fechaReembolsoFormateada = fechaReembolso.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    doc.text(`Fecha: ${fechaReembolsoFormateada}`, 10, y);
    y += 4;
    doc.text(`Monto: $${Number(reembolsoAprobado.monto || 0).toFixed(2)}`, 10, y);
    y += 6;
  }

  // 💖 Mensaje final
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  if (reembolsoAprobado) {
    doc.text("Venta cancelada", 40, y, { align: "center" });
  } else {
    doc.text("¡Gracias por su compra!", 40, y, { align: "center" });
  }

  // 🖨 Abrir vista previa (puedes usar save() si prefieres descargar)
  window.open(doc.output("bloburl"), "_blank");
};

export default generatePDF;
