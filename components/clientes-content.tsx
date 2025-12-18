"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, DollarSign } from "lucide-react"

export function ClientesContent() {
  const clientes = [
    {
      id: "C001",
      nombre: "María González",
      documento: "1234567890",
      telefono: "310-555-0123",
      tipo: "Crédito",
      saldo: 450000,
      limite: 1000000,
    },
    {
      id: "C002",
      nombre: "Juan Pérez",
      documento: "9876543210",
      telefono: "320-555-0456",
      tipo: "Normal",
      saldo: 0,
      limite: 0,
    },
    {
      id: "C003",
      nombre: "Ana Martínez",
      documento: "5555555555",
      telefono: "315-555-0789",
      tipo: "Crédito",
      saldo: 850000,
      limite: 1500000,
    },
    {
      id: "C004",
      nombre: "Carlos López",
      documento: "4444444444",
      telefono: "305-555-0321",
      tipo: "Crédito",
      saldo: 0,
      limite: 800000,
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestión de clientes y cuentas por cobrar</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar cliente por nombre o documento..." />
            </div>
            <Button variant="outline">Buscar</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Documento</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Teléfono</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Saldo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Límite</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente, index) => (
                  <tr key={cliente.id} className={index !== clientes.length - 1 ? "border-b" : ""}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{cliente.nombre}</p>
                        <p className="text-sm text-muted-foreground">{cliente.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{cliente.documento}</td>
                    <td className="px-4 py-3 text-sm">{cliente.telefono}</td>
                    <td className="px-4 py-3">
                      <Badge variant={cliente.tipo === "Crédito" ? "default" : "secondary"}>{cliente.tipo}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {cliente.saldo > 0 ? (
                        <span className="font-medium text-primary">${cliente.saldo.toLocaleString("es-CO")}</span>
                      ) : (
                        <span className="text-muted-foreground">$0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {cliente.limite > 0 ? `$${cliente.limite.toLocaleString("es-CO")}` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
                        {cliente.tipo === "Crédito" && cliente.saldo > 0 && (
                          <Button size="sm" variant="default">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Abonar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{clientes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Clientes Crédito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{clientes.filter((c) => c.tipo === "Crédito").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              ${clientes.reduce((sum, c) => sum + c.saldo, 0).toLocaleString("es-CO")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
