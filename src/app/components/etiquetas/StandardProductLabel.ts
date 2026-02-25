/**
 * Componente StandardProductLabel
 * 
 * Etiqueta estandarizada de producto para Banque Alimentaire
 * Basado en el diseño oficial con dimensiones y estilos consistentes
 * 
 * Dimensiones: Optimizada para una sola hoja Letter (8.5in x 11in)
 * Colores oficiales:
 * - Azul: #1E73BE
 * - Verde: #4CAF50
 * - Gris: #F4F4F4/#333333
 * - Rojo: #DC3545
 * - Naranja: #FFC107
 * 
 * Tipografías:
 * - Montserrat Bold para títulos
 * - Montserrat Medium para etiquetas
 * - Roboto Regular para cuerpo de texto
 */

import QRCode from 'qrcode';

export interface ProductLabelData {
  // Identificación
  id: string;
  
  // Producto
  nombreProducto: string;
  productoIcono?: string;
  categoria?: string;
  subcategoria?: string;
  
  // Cantidades
  cantidad: number;
  unidad: string;
  pesoTotal: number;
  pesoUnidad?: number;
  
  // Almacenamiento
  temperatura: 'ambiente' | 'refrigerado' | 'congelado';
  lote?: string;
  fechaCaducidad?: string;
  detallesEmpaque?: string; // Ejemplo: "45x900ml", "24x500g"
  
  // Procedencia
  programa?: string;
  programaIcono?: string;
  programaColor?: string;
  donadorNombre?: string;
  
  // Fecha
  fechaEntrada?: string;
  
  // Traducciones
  translations?: {
    foodBank?: string;
    productLabel?: string;
    quantity?: string;
    temperature?: string;
    lot?: string;
    expiryDate?: string;
    weight?: string;
    program?: string;
    donor?: string;
    entryDate?: string;
    systemFooter?: string;
    ambient?: string;
    refrigerated?: string;
    frozen?: string;
    packagingDetails?: string;
  };
}

/**
 * Genera el HTML de una etiqueta estandarizada
 */
export async function generateStandardProductLabel(
  data: ProductLabelData
): Promise<string> {
  // Traducciones por defecto (francés)
  const t = {
    foodBank: data.translations?.foodBank || 'BANQUE ALIMENTAIRE',
    productLabel: data.translations?.productLabel || 'Étiquette du Produit',
    quantity: data.translations?.quantity || 'QUANTITÉ',
    temperature: data.translations?.temperature || 'TEMPÉRATURE',
    lot: data.translations?.lot || 'LOT',
    expiryDate: data.translations?.expiryDate || "DATE D'EXPIRATION",
    weight: data.translations?.weight || 'POIDS',
    program: data.translations?.program || 'PROGRAMME',
    donor: data.translations?.donor || 'DONATEUR',
    entryDate: data.translations?.entryDate || "DATE D'ENTRÉE",
    systemFooter: data.translations?.systemFooter || 'Système de Gestion des Stocks',
    ambient: data.translations?.ambient || 'Ambiant',
    refrigerated: data.translations?.refrigerated || 'Réfrigéré',
    frozen: data.translations?.frozen || 'Congelé',
    packagingDetails: data.translations?.packagingDetails || 'Détails de l\'empaquetage'
  };

  // Generar QR Code (reducido para optimizar espacio)
  const qrData = `BANCO-ALIMENTOS-${data.id}-${data.nombreProducto}-${data.pesoTotal.toFixed(2)}kg`;
  let qrImageBase64 = '';
  try {
    qrImageBase64 = await QRCode.toDataURL(qrData, {
      width: 140,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#1E73BE',
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('Error generando QR:', err);
  }

  // Icono y texto de temperatura
  const tempConfig = {
    ambiente: { icon: '🌡️', text: t.ambient, color: '#FFC107' },
    refrigerado: { icon: '❄️', text: t.refrigerated, color: '#1E73BE' },
    congelado: { icon: '🧊', text: t.frozen, color: '#0288D1' }
  };
  const tempInfo = tempConfig[data.temperatura] || tempConfig.ambiente;

  // Formato de fecha
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) {
      const now = new Date();
      return now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.productLabel} - ${data.id}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  <style>
    @page {
      size: letter;
      margin: 0.4in 0.5in;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Roboto', Arial, sans-serif;
      background: white;
      padding: 0;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
    }
    
    .etiqueta-container {
      width: 100%;
      max-width: 7.5in;
      margin: 0 auto;
      border: 3px solid #1E73BE;
      border-radius: 10px;
      overflow: hidden;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    /* HEADER - Compacto */
    .etiqueta-header {
      background: white;
      padding: 12px 16px;
      text-align: center;
      border-bottom: 3px solid #1E73BE;
    }
    
    .etiqueta-header h1 {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 24px;
      color: #1E73BE;
      margin: 0 0 2px 0;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .etiqueta-header p {
      font-family: 'Roboto', sans-serif;
      font-size: 12px;
      color: #666666;
      margin: 0;
    }
    
    /* QR SECTION - Compacto */
    .qr-section {
      background: white;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .qr-code-wrapper {
      border: 2px solid #1E73BE;
      border-radius: 6px;
      padding: 6px;
      background: white;
      display: inline-block;
    }
    
    .qr-code-wrapper img {
      display: block;
      width: 120px;
      height: 120px;
    }
    
    .qr-id {
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 12px;
      color: #1E73BE;
      margin-top: 8px;
    }
    
    /* PRODUCTO SECTION - Compacto */
    .producto-section {
      background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
      padding: 12px 16px;
      text-align: center;
      border-top: 2px solid #1E73BE;
      border-bottom: 2px solid #1E73BE;
    }
    
    .producto-icono {
      font-size: 32px;
      margin-bottom: 4px;
      line-height: 1;
    }
    
    .producto-nombre {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 18px;
      color: #1E73BE;
      margin: 4px 0;
      line-height: 1.2;
    }
    
    .producto-subcategoria {
      font-family: 'Roboto', sans-serif;
      font-weight: 500;
      font-size: 13px;
      color: #333333;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    
    /* INFO FIELDS - Compacto */
    .info-fields {
      padding: 10px 16px;
      background: #FAFAFA;
    }
    
    .info-field {
      background: white;
      border-left: 3px solid #1E73BE;
      padding: 8px 12px;
      margin-bottom: 6px;
      border-radius: 3px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .info-field:last-child {
      margin-bottom: 0;
    }
    
    .info-field-label {
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 9px;
      color: #666666;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 3px;
      display: block;
    }
    
    .info-field-value {
      font-family: 'Roboto', sans-serif;
      font-weight: 500;
      font-size: 14px;
      color: #333333;
    }
    
    .temperature-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 600;
      background: white;
      border: 2px solid ${tempInfo.color};
      color: ${tempInfo.color};
    }
    
    /* PESO SECTION - Compacto */
    .peso-section {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      padding: 12px 16px;
      text-align: center;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .peso-section h3 {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 24px;
      color: white;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      letter-spacing: 0.4px;
    }
    
    /* PROGRAMA SECTION - Compacto */
    .programa-section {
      background: linear-gradient(135deg, #1E73BE 0%, #1565C0 100%);
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-top: 3px solid #FFC107;
      border-bottom: 3px solid #FFC107;
    }
    
    .programa-icon {
      font-size: 22px;
      line-height: 1;
    }
    
    .programa-content {
      flex: 1;
    }
    
    .programa-label {
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 9px;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 2px;
    }
    
    .programa-value {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 16px;
      color: white;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    /* FECHA SECTION - Compacto */
    .fecha-section {
      background: white;
      padding: 8px 16px;
      border-bottom: 1px solid #E0E0E0;
    }
    
    .fecha-label {
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 9px;
      color: #666666;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 3px;
    }
    
    .fecha-value {
      font-family: 'Roboto', sans-serif;
      font-weight: 500;
      font-size: 13px;
      color: #333333;
    }
    
    /* FOOTER - Compacto */
    .etiqueta-footer {
      background: white;
      padding: 8px 16px;
      text-align: center;
    }
    
    .etiqueta-footer p {
      font-family: 'Roboto', sans-serif;
      font-size: 10px;
      color: #999999;
      margin: 0;
    }
    
    /* PRINT BUTTONS */
    .print-buttons {
      display: flex;
      gap: 10px;
      justify-content: center;
      padding: 16px;
      background: #F9F9F9;
      border-top: 2px solid #E0E0E0;
    }
    
    .btn {
      padding: 10px 24px;
      border: none;
      border-radius: 6px;
      font-family: 'Montserrat', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .btn-print {
      background: linear-gradient(135deg, #1E73BE 0%, #1565C0 100%);
      color: white;
    }
    
    .btn-print:hover {
      background: linear-gradient(135deg, #1565C0 0%, #0d47a1 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(30, 115, 190, 0.3);
    }
    
    .btn-close {
      background: linear-gradient(135deg, #DC3545 0%, #c82333 100%);
      color: white;
    }
    
    .btn-close:hover {
      background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
    }
    
    @media print {
      body {
        padding: 0;
        display: block;
      }
      
      .print-buttons {
        display: none !important;
      }
      
      .etiqueta-container {
        box-shadow: none;
        max-width: none;
        width: 100%;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="etiqueta-container">
    <!-- HEADER -->
    <div class="etiqueta-header">
      <h1><span>🏦</span> ${t.foodBank}</h1>
      <p>${t.productLabel}</p>
    </div>
    
    <!-- QR SECTION -->
    <div class="qr-section">
      <div class="qr-code-wrapper">
        <img src="${qrImageBase64}" alt="QR Code" />
      </div>
      <div class="qr-id">ID: ${data.id}</div>
    </div>
    
    <!-- PRODUCTO SECTION -->
    <div class="producto-section">
      ${data.productoIcono ? `<div class="producto-icono">${data.productoIcono}</div>` : ''}
      <div class="producto-nombre">
        ${data.categoria || ''} ${data.categoria && data.nombreProducto ? '-' : ''} ${data.nombreProducto}
      </div>
      ${data.subcategoria ? `
        <div class="producto-subcategoria">
          <span>🍊</span>
          <span>${data.subcategoria}</span>
        </div>
      ` : ''}
    </div>
    
    <!-- INFO FIELDS -->
    <div class="info-fields">
      <!-- Cantidad -->
      <div class="info-field">
        <span class="info-field-label">${t.quantity}</span>
        <div class="info-field-value">${data.cantidad} ${data.unidad}</div>
      </div>
      
      <!-- Temperatura -->
      <div class="info-field">
        <span class="info-field-label">${t.temperature}</span>
        <div class="info-field-value">
          <span class="temperature-badge">
            <span>${tempInfo.icon}</span>
            <span>${tempInfo.text}</span>
          </span>
        </div>
      </div>
      
      <!-- Lote (si existe) -->
      ${data.lote ? `
        <div class="info-field">
          <span class="info-field-label">${t.lot}</span>
          <div class="info-field-value">${data.lote}</div>
        </div>
      ` : ''}
      
      <!-- Fecha de caducidad (si existe) -->
      ${data.fechaCaducidad ? `
        <div class="info-field">
          <span class="info-field-label">${t.expiryDate}</span>
          <div class="info-field-value">${formatDate(data.fechaCaducidad)}</div>
        </div>
      ` : ''}
      
      <!-- Detalles de empaque (si existen) -->
      ${data.detallesEmpaque ? `
        <div class="info-field">
          <span class="info-field-label">${t.packagingDetails}</span>
          <div class="info-field-value">${data.detallesEmpaque}</div>
        </div>
      ` : ''}
    </div>
    
    <!-- PESO SECTION -->
    <div class="peso-section">
      <h3>${t.weight}: ${data.pesoTotal.toFixed(2)} kg</h3>
    </div>
    
    <!-- DONADOR SECTION (si existe) -->
    ${data.donadorNombre ? `
      <div class="fecha-section">
        <div class="fecha-label">${t.donor}</div>
        <div class="fecha-value">${data.donadorNombre}</div>
      </div>
    ` : ''}
    
    <!-- PROGRAMA SECTION -->
    ${data.programa ? `
      <div class="programa-section">
        ${data.programaIcono ? `<div class="programa-icon">${data.programaIcono}</div>` : '<div class="programa-icon">📋</div>'}
        <div class="programa-content">
          <div class="programa-label">${t.program}</div>
          <div class="programa-value">${data.programa}</div>
        </div>
      </div>
    ` : ''}
    
    <!-- FECHA DE ENTRADA -->
    <div class="fecha-section">
      <div class="fecha-label">${t.entryDate}</div>
      <div class="fecha-value">${formatDateTime(data.fechaEntrada)}</div>
    </div>
    
    <!-- FOOTER -->
    <div class="etiqueta-footer">
      <p>${t.systemFooter}</p>
    </div>
  </div>
  
  <!-- PRINT BUTTONS -->
  <div class="print-buttons">
    <button class="btn btn-print" onclick="handlePrint()">
      🖨️ Imprimer l'étiquette
    </button>
    <button class="btn btn-close" onclick="window.close()">
      ✖ Fermer
    </button>
  </div>
  
  <script>
    console.log('🖨️ Etiqueta de Producto - Versión con cierre automático activada');
    
    function handlePrint() {
      console.log('📝 Iniciando impresión...');
      window.print();
      
      // Cerrar la ventana después de que termine la impresión
      window.addEventListener('afterprint', function() {
        console.log('✅ Impresión completada - Cerrando ventana...');
        window.close();
      });
    }
  </script>
</body>
</html>
  `.trim();
}

/**
 * Abre una ventana de impresión con la etiqueta estandarizada
 */
export async function printStandardLabel(data: ProductLabelData, silent: boolean = false): Promise<void> {
  const html = await generateStandardProductLabel(data);
  
  if (silent) {
    // Modo silencioso: Crear iframe oculto para impresión automática
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      throw new Error('No se pudo crear el documento de impresión');
    }
    
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
    
    // Esperar a que se cargue el contenido
    iframe.onload = () => {
      setTimeout(() => {
        try {
          // Intentar imprimir directamente
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          
          // Limpiar después de un tiempo
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        } catch (err) {
          console.error('Error en impresión silenciosa:', err);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }
      }, 300);
    };
  } else {
    // Modo normal: Abrir ventana nueva
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      throw new Error('No se pudo abrir la ventana de impresión');
    }
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Esperar a que se cargue el contenido y luego imprimir automáticamente
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Cerrar la ventana después de imprimir o cancelar
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 250);
    };
  }
}