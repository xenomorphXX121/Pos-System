"use client"

import { useState, useRef } from "react"
import { Plus, Minus, Trash2, Printer, ShoppingCart, Calculator, Save, CheckCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BillItem {
  id: string
  name: string
  price: number
  quantity: number
  total: number
}

interface SaleData {
  subtotal: number
  discount_type: "percentage" | "amount"
  discount_value: number
  discount_amount: number
  total_amount: number
  payment_received: number | null
  change_amount: number
  payment_status: "pending" | "completed" | "cancelled"
  items: Array<{
    product_name: string
    unit_price: number
    quantity: number
    total_price: number
  }>
}

export default function POSBilling() {
  const [items, setItems] = useState<BillItem[]>([])
  const [productName, setProductName] = useState("")
  const [productPrice, setProductPrice] = useState("")
  const [productQuantity, setProductQuantity] = useState("1")
  const [discount, setDiscount] = useState("0")
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage")
  const [paymentReceived, setPaymentReceived] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [lastSaleId, setLastSaleId] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const API_BASE_URL = "https://sellerpos.pythonanywhere.com/api"
  // const API_BASE_URL = "http://127.0.0.1:8888/api"

  const addItem = () => {
    if (!productName || !productPrice || !productQuantity) return

    const price = Number.parseFloat(productPrice)
    const quantity = Number.parseInt(productQuantity)
    const total = price * quantity

    const newItem: BillItem = {
      id: Date.now().toString(),
      name: productName,
      price,
      quantity,
      total,
    }

    setItems([...items, newItem])
    setProductName("")
    setProductPrice("")
    setProductQuantity("1")
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) return
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity, total: item.price * newQuantity } : item,
      ),
    )
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const discountValue =
    discountType === "percentage"
      ? (subtotal * Number.parseFloat(discount || "0")) / 100
      : Number.parseFloat(discount || "0")
  const finalTotal = subtotal - discountValue
  const change = Number.parseFloat(paymentReceived || "0") - finalTotal

  const saveSale = async () => {
    if (items.length === 0) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
      return
    }

    setIsSaving(true)
    setSaveStatus("idle")

    const saleData: SaleData = {
      subtotal: Number.parseFloat(subtotal.toFixed(2)),
      discount_type: discountType,
      discount_value: Number.parseFloat(discount || "0"),
      discount_amount: Number.parseFloat(discountValue.toFixed(2)),
      total_amount: Number.parseFloat(finalTotal.toFixed(2)),
      payment_received: paymentReceived ? Number.parseFloat(paymentReceived) : null,
      change_amount: Number.parseFloat(change.toFixed(2)),
      payment_status: paymentReceived && change >= 0 ? "completed" : "pending",
      items: items.map((item) => ({
        product_name: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        total_price: item.total,
      })),
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sales/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      })

      if (response.ok) {
        const result = await response.json()
        setLastSaleId(result.sale_id)
        setSaveStatus("success")
        setTimeout(() => setSaveStatus("idle"), 3000)
      } else {
        throw new Error("Failed to save sale")
      }
    } catch (error) {
      console.error("Error saving sale:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Bill Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt { max-width: 400px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .items { margin: 20px 0; }
            .totals { margin-top: 20px; }
            .line { border-bottom: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { text-align: left; padding: 5px 0; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const clearBill = () => {
    setItems([])
    setDiscount("0")
    setPaymentReceived("")
    setSaveStatus("idle")
    setLastSaleId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Status Alerts */}
        {saveStatus === "success" && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Sale saved successfully! Sale ID: {lastSaleId}
            </AlertDescription>
          </Alert>
        )}

        {saveStatus === "error" && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">Failed to save sale. Please try again.</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Entry Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Product
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="productPrice">Price ($)</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    step="0.01"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="productQuantity">Quantity</Label>
                  <Input
                    id="productQuantity"
                    type="number"
                    min="1"
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(e.target.value)}
                  />
                </div>
                <Button onClick={addItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Bill
                </Button>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Payment & Discount
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="discount">Discount</Label>
                  <div className="flex gap-2">
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0"
                    />
                    <Button
                      variant={discountType === "percentage" ? "default" : "outline"}
                      onClick={() => setDiscountType("percentage")}
                      size="sm"
                    >
                      %
                    </Button>
                    <Button
                      variant={discountType === "amount" ? "default" : "outline"}
                      onClick={() => setDiscountType("amount")}
                      size="sm"
                    >
                      $
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="payment">Payment Received ($)</Label>
                  <Input
                    id="payment"
                    type="number"
                    step="0.01"
                    value={paymentReceived}
                    onChange={(e) => setPaymentReceived(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                {change >= 0 && paymentReceived && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      Change: <span className="font-bold">${change.toFixed(2)}</span>
                    </p>
                  </div>
                )}
                {change < 0 && paymentReceived && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">
                      Insufficient payment: <span className="font-bold">${Math.abs(change).toFixed(2)} short</span>
                    </p>
                  </div>
                )}
                <Button onClick={saveSale} className="w-full" disabled={isSaving || items.length === 0}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Sale
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Bill Display Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Current Bill
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={handlePrint} variant="outline" size="sm">
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button onClick={clearBill} variant="outline" size="sm">
                      Clear Bill
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No items added yet</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>${item.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => removeItem(item.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {discountValue > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({discountType === "percentage" ? `${discount}%` : `$${discount}`}):</span>
                          <span>-${discountValue.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>${finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden Print Section */}
        <div ref={printRef} className="hidden">
          <div className="receipt">
            <div className="header">
              <h2>Shundor Space</h2>
              {lastSaleId && <p>Sale ID: {lastSaleId}</p>}
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Time: {new Date().toLocaleTimeString()}</p>
            </div>
            <div className="line"></div>
            <div className="items">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th className="right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td className="right">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="line"></div>
            <div className="totals">
              <div className="flex" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Discount:</span>
                  <span>-${discountValue.toFixed(2)}</span>
                </div>
              )}
              <div
                className="flex bold"
                style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}
              >
                <span>TOTAL:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
              {paymentReceived && (
                <>
                  <div className="flex" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Payment:</span>
                    <span>${Number.parseFloat(paymentReceived).toFixed(2)}</span>
                  </div>
                  <div className="flex" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Change:</span>
                    <span>${change.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="line"></div>
            <div className="header">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
