"use client"

import { useEffect, useRef, useState } from 'react'
import JsBarcode from 'jsbarcode'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Printer, X } from 'lucide-react'

interface ProductLabelProps {
  sku: string
  codigo_barras: string
  nombre: string
  color?: string
  talla: string
  precio: number
  cantidad?: number
  onClose?: () => void
}

export function ProductLabel({
  sku,
  codigo_barras,
  nombre,
  color,
  talla,
  precio,
  cantidad = 1,
  onClose
}: ProductLabelProps) {
  const barcodeRefs = useRef<(SVGSVGElement | null)[]>([])
  const [cantidadEtiquetas, setCantidadEtiquetas] = useState(cantidad)

  useEffect(() => {
    barcodeRefs.current.forEach((ref) => {
      if (ref && codigo_barras) {
        try {
          JsBarcode(ref, codigo_barras, {
            format: 'EAN13',
            width: 1,
            height: 30,
            displayValue: false,
            margin: 1,
            marginTop: 1,
            marginBottom: 1,
            background: '#ffffff',
            lineColor: '#000000'
          })
        } catch (error) {
          console.error('Error generando código de barras:', error)
        }
      }
    })
  }, [codigo_barras, cantidadEtiquetas])

  const handlePrint = () => {
    window.print()
  }

  const descripcionCorta = nombre.substring(0, 24)
  const colorMostrar = color ? color.substring(0, 10) : ''

  // Calcular configuración dinámica según cantidad de etiquetas
  const getLayoutConfig = (qty: number) => {
    if (qty === 1) return { cols: 1, gap: '20px' }
    if (qty === 2) return { cols: 2, gap: '20px' }
    if (qty <= 4) return { cols: 2, gap: '20px' }
    if (qty <= 6) return { cols: 2, gap: '18px' }
    if (qty <= 9) return { cols: 3, gap: '16px' }
    if (qty <= 12) return { cols: 3, gap: '14px' }
    return { cols: 4, gap: '12px' }
  }

  const layoutConfig = getLayoutConfig(cantidadEtiquetas)

  const handleCantidadChange = (value: string) => {
    const num = parseInt(value)
    if (!isNaN(num) && num > 0 && num <= 100) {
      setCantidadEtiquetas(num)
    } else if (value === '') {
      setCantidadEtiquetas(1)
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header con botones */}
      <div className="mb-4 no-print flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center border-b pb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir {cantidadEtiquetas > 1 ? `${cantidadEtiquetas} Etiquetas` : 'Etiqueta'}
          </Button>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="cantidad-etiquetas" className="text-sm whitespace-nowrap">
              Cantidad:
            </Label>
            <Input
              id="cantidad-etiquetas"
              type="number"
              min="1"
              max="100"
              value={cantidadEtiquetas}
              onChange={(e) => handleCantidadChange(e.target.value)}
              className="w-20 h-9"
            />
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
            <span className="hidden sm:inline">SKU: <strong>{sku}</strong></span>
            <span className="sm:inline hidden text-muted-foreground/50">|</span>
            <span className="hidden sm:inline">Código: <strong>{codigo_barras}</strong></span>
          </div>
        </div>
      </div>

      {/* Contenedor de etiquetas con scroll */}
      <div 
        className="print-container overflow-y-auto flex-1 pr-2"
      >
        <div 
          className="labels-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(110px, max-content))`,
            gap: layoutConfig.gap,
            padding: '12px',
            justifyContent: 'center',
            justifyItems: 'center'
          }}
        >
          {Array.from({ length: cantidadEtiquetas }).map((_, index) => (
            <div
              key={index}
              className="label-item"
              style={{
                width: '110px',
                height: '95px',
                border: '1px solid #000',
                borderRadius: '2px',
                padding: '4px',
                fontFamily: 'Arial, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'white',
                boxSizing: 'border-box'
              }}
            >
              {/* NOMBRE EMPRESA */}
              <div 
                className="store-logo"
                style={{ 
                  fontSize: '7px', 
                  fontWeight: '900', 
                  textAlign: 'center',
                  letterSpacing: '0.5px',
                  color: '#000',
                  borderBottom: '1px solid #000',
                  paddingBottom: '1px',
                  marginBottom: '2px'
                }}>
                VALVA BOUTIQUE
              </div>

              {/* CÓDIGO DE BARRAS */}
              <div 
                className="barcode-container"
                style={{ 
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '1px',
                  minHeight: '32px'
                }}>
                <svg ref={(el) => { barcodeRefs.current[index] = el }}></svg>
              </div>

              {/* CÓDIGO (número) */}
              <div 
                className="codigo-text"
                style={{ 
                  textAlign: 'center',
                  fontSize: '6px',
                  fontWeight: '700',
                  fontFamily: 'Consolas, monospace',
                  color: '#000',
                  marginBottom: '2px',
                  letterSpacing: '0.2px'
                }}>
                {codigo_barras}
              </div>

              {/* REFERENCIA Y PRECIO */}
              <div 
                className="footer-info"
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: '2px',
                  borderTop: '1px solid #000',
                  marginTop: 'auto'
                }}>
                <div>
                  <div style={{ 
                    fontSize: '5px', 
                    color: '#666', 
                    fontWeight: '600',
                    marginBottom: '1px'
                  }}>
                    REF
                  </div>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '6px', 
                    fontFamily: 'Consolas, monospace',
                    color: '#000'
                  }}>
                    {sku}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  fontWeight: '700',
                  color: '#000'
                }}>
                  ${precio.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estilos de impresión */}
      <style jsx>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          
          @page {
            size: letter;
            margin: 10mm;
          }
          
          html, body {
            margin: 0;
            padding: 0;
            background: white;
            width: 100%;
            height: 100%;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print-container,
          .print-container * {
            visibility: visible;
          }
          
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            overflow: visible !important;
            max-height: none !important;
            background: white;
          }
          
          .labels-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 30mm) !important;
            gap: 8mm 5mm !important;
            padding: 0 !important;
            margin: 0 !important;
            justify-content: center !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .label-item {
            page-break-inside: avoid;
            margin: 0 !important;
            border: 1px solid #000 !important;
            background: white !important;
            box-shadow: none !important;
            width: 30mm !important;
            height: 25mm !important;
            padding: 1.5mm !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          .store-logo {
            color: #000 !important;
            font-weight: 900 !important;
            font-size: 6pt !important;
            border-bottom: 0.5px solid #000 !important;
            padding-bottom: 0.5mm !important;
            margin-bottom: 0.5mm !important;
            letter-spacing: 0.3px !important;
            text-align: center !important;
          }
          
          .barcode-container {
            text-align: center !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin-bottom: 0.5mm !important;
            min-height: 30px !important;
            max-height: 30px !important;
          }
          
          .barcode-container svg {
            max-width: 100% !important;
            height: auto !important;
            max-height: 30px !important;
          }
          
          .codigo-text {
            font-weight: 700 !important;
            font-size: 5pt !important;
            color: #000 !important;
            text-align: center !important;
            margin-bottom: 0.5mm !important;
            letter-spacing: 0.2px !important;
            font-family: 'Consolas', monospace !important;
            line-height: 1 !important;
          }
          
          .footer-info {
            border-top: 0.5px solid #000 !important;
            padding-top: 0.5mm !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-top: auto !important;
          }
          
          .footer-info > div > div:first-child {
            font-size: 4pt !important;
            color: #666 !important;
            font-weight: 600 !important;
            margin-bottom: 0.3mm !important;
          }
          
          .footer-info > div > div:last-child {
            font-size: 5pt !important;
            color: #000 !important;
            font-weight: 700 !important;
            font-family: 'Consolas', monospace !important;
          }
          
          .footer-info > div:last-child {
            font-size: 9pt !important;
            font-weight: 700 !important;
            color: #000 !important;
          }
        }
        
        @media screen {
          .print-container::-webkit-scrollbar {
            width: 8px;
          }
          
          .print-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          .print-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          
          .print-container::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        }
      `}</style>
    </div>
  )
}
