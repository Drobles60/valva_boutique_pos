import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event, data } = body

// Process different event types
    switch (event) {
      case "nueva_venta":
        // Handle new sale event
break

      case "bajo_inventario":
        // Handle low inventory alert
break

      case "nuevo_cliente":
        // Handle new customer event
break

      case "pago_recibido":
        // Handle payment received event
break

      default:
}

    return NextResponse.json({ success: true, message: "Webhook processed successfully" })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ success: false, error: "Failed to process webhook" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "n8n Webhook Endpoint for Valva POS",
    events: ["nueva_venta", "bajo_inventario", "nuevo_cliente", "pago_recibido"],
  })
}

