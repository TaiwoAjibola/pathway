"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { FileText, Loader2 } from "lucide-react"

const statusLabels: Record<string, string> = {
  NOT_UPLOADED: "Not Uploaded", UPLOADED: "Uploaded", REVIEWING: "Reviewing",
  APPROVED: "Approved", REJECTED: "Rejected", EXPIRING_SOON: "Expiring Soon", EXPIRED: "Expired",
}

type Document = {
  id: string
  name: string
  status: string
  issuingAuthority: string | null
  expiryDate: string | null
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState("ALL")

  const fetchDocs = () => {
    fetch("/api/documents").then((r) => r.json()).then(setDocs).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(fetchDocs, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>

  const uploaded = docs.filter((d) => d.status !== "NOT_UPLOADED").length
  const approved = docs.filter((d) => d.status === "APPROVED").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Documents</h1>
        <p className="mt-1 text-sm text-gray-500">{uploaded} of {docs.length} uploaded · {approved} approved</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><p className="text-sm text-gray-500">Uploaded</p><p className="text-2xl font-bold text-gray-900">{uploaded}/{docs.length}</p><ProgressBar progress={(uploaded / Math.max(docs.length, 1)) * 100} size="sm" className="mt-2" /></Card>
        <Card className="border-green-200"><p className="text-sm text-gray-500">Approved</p><p className="text-2xl font-bold text-green-600">{approved}</p></Card>
        <Card className="border-yellow-200"><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-yellow-600">{docs.filter((d) => ["UPLOADED", "REVIEWING"].includes(d.status)).length}</p></Card>
        <Card className="border-red-200"><p className="text-sm text-gray-500">Missing</p><p className="text-2xl font-bold text-red-600">{docs.filter((d) => d.status === "NOT_UPLOADED").length}</p></Card>
      </div>

      {docs.length === 0 && (
        <Card><p className="text-sm text-gray-500 text-center py-8">No documents found. Documents will appear once you add them to your application.</p></Card>
      )}

      <div className="space-y-3">
        {docs.map((doc) => (
          <div key={doc.id} className="flex items-center gap-4 rounded-lg border border-gray-100 p-4 dark:border-gray-800">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
              doc.status === "APPROVED" ? "bg-green-100 text-green-600" : doc.status === "NOT_UPLOADED" ? "bg-gray-100 text-gray-400" : "bg-blue-100 text-blue-600"
            }`}>
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{doc.name}</p>
                <Badge variant={doc.status === "APPROVED" ? "success" : doc.status === "REVIEWING" ? "info" : doc.status === "NOT_UPLOADED" ? "outline" : "warning"}>
                  {statusLabels[doc.status] || doc.status}
                </Badge>
              </div>
              {doc.issuingAuthority && <p className="text-xs text-gray-500 mt-0.5">{doc.issuingAuthority}</p>}
            </div>
            {doc.expiryDate && <span className="text-xs text-gray-400">Exp: {new Date(doc.expiryDate).toLocaleDateString()}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
