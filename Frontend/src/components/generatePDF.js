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
  doc.setFont("helvetica", "bold");
  doc.text("Total a pagar:", 10, y);
  doc.text(`$${Number(venta.total || 0).toFixed(2)}`, 70, y, { align: "right" });
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text(`Método de pago: ${venta.metodo_pago || "-"}`, 10, y);
  y += 6;

  doc.text("------------------------------", 10, y);
  y += 10;

  // 💖 Mensaje final
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("¡Gracias por su compra!", 40, y, { align: "center" });

  // 🖨 Abrir vista previa (puedes usar save() si prefieres descargar)
  window.open(doc.output("bloburl"), "_blank");
};

export default generatePDF;
