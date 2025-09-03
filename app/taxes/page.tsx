import { TaxesDashboard } from "@/components/taxes-dashboard"

export default function TaxesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tax Dashboard</h1>
        <p className="text-muted-foreground">
          Consolidated view of all tax information across your properties
        </p>
      </div>
      
      <TaxesDashboard />
    </div>
  )
}
