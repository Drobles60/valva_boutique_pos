import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event, data } = body

    console.log("[v0] n8n webhook received:", { event, data })

    // Process different event types
    switch (event) {
      case "nueva_venta":
        // Handle new sale event
        console.log("[v0] Processing nueva_venta event")
        break

      case "bajo_inventario":
        // Handle low inventory alert
        console.log("[v0] Processing bajo_inventario event")
        break

      case "nuevo_cliente":
        // Handle new customer event
        console.log("[v0] Processing nuevo_cliente event")
        break

      case "pago_recibido":
        // Handle payment received event
        console.log("[v0] Processing pago_recibido event")
        break

      default:
        console.log("[v0] Unknown event type:", event)
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
