"use client"

import { useState } from "react"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { getStatusColor, getStatusLabel, formatDate, daysUntil } from "@/lib/utils"
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Download,
  AlertCircle,
  Info,
} from "lucide-react"

const documents = [
  { id: "d1", name: "Valid Passport", category: "Identity", status: "APPROVED", issuingAuthority: "Your country's passport office", expiryDate: "2027-03-15", uploadedVersion: "v2", aiReviewed: true },
  { id: "d2", name: "Passport-sized Photos", category: "Identity", status: "APPROVED", issuingAuthority: "Photographer", expiryDate: null, uploadedVersion: "v1", aiReviewed: true },
  { id: "d3", name: "Birth Certificate", category: "Identity", status: "UPLOADED", issuingAuthority: "Vital Statistics Office", expiryDate: null, uploadedVersion: "v1", aiReviewed: false },
  { id: "d4", name: "Marriage Certificate", category: "Identity", status: "REVIEWING", issuingAuthority: "Vital Statistics Office", expiryDate: null, uploadedVersion: "v1", aiReviewed: true },
  { id: "d5", name: "Degree Certificate (Bachelor's)", category: "Education", status: "APPROVED", issuingAuthority: "University", expiryDate: null, uploadedVersion: "v1", aiReviewed: true },
  { id: "d6", name: "Academic Transcripts", category: "Education", status: "UPLOADED", issuingAuthority: "University", expiryDate: null, uploadedVersion: "v1", aiReviewed: false },
  { id: "d7", name: "ECA Report (WES)", category: "Education", status: "NOT_UPLOADED", issuingAuthority: "WES", expiryDate: "2027-09-01", uploadedVersion: null, aiReviewed: false },
  { id: "d8", name: "IELTS Test Report Form", category: "Language", status: "NOT_UPLOADED", issuingAuthority: "British Council / IDP", expiryDate: "2028-08-20", uploadedVersion: null, aiReviewed: false },
  { id: "d9", name: "Employment Reference Letter (Current)", category: "Employment", status: "NOT_UPLOADED", issuingAuthority: "Current Employer", expiryDate: null, uploadedVersion: null, aiReviewed: false },
  { id: "d10", name: "Employment Reference Letter (Previous)", category: "Employment", status: "NOT_UPLOADED", issuingAuthority: "Previous Employer", expiryDate: null, uploadedVersion: null, aiReviewed: false },
  { id: "d11", name: "Pay Stubs (Last 3 months)", category: "Employment", status: "NOT_UPLOADED", issuingAuthority: "Employer", expiryDate: null, uploadedVersion: null, aiReviewed: false },
  { id: "d12", name: "Bank Statements (Last 6 months)", category: "Financial", status: "UPLOADED", issuingAuthority: "Bank", expiryDate: "2026-10-01", uploadedVersion: "v1", aiReviewed: true },
  { id: "d13", name: "Police Certificate", category: "Legal", status: "NOT_UPLOADED", issuingAuthority: "Police / FBI", expiryDate: "2027-08-15", uploadedVersion: null, aiReviewed: false },
  { id: "d14", name: "Proof of Upfront Medical Exam", category: "Medical", status: "NOT_UPLOADED", issuingAuthority: "Panel Physician", expiryDate: "2027-07-01", uploadedVersion: null, aiReviewed: false },
  { id: "d15", name: "CV/Resume", category: "Employment", status: "UPLOADED", issuingAuthority: "Self", expiryDate: null, uploadedVersion: "v2", aiReviewed: false },
  { id: "d16", name: "Digital Photos (PR Card)", category: "Identity", status: "NOT_UPLOADED", issuingAuthority: "Photographer", expiryDate: null, uploadedVersion: null, aiReviewed: false },
  { id: "d17", name: "TEF Canada Results", category: "Language", status: "NOT_UPLOADED", issuingAuthority: "CCI Paris IDF", expiryDate: "2028-06-01", uploadedVersion: null, aiReviewed: false },
  { id: "d18", name: "Proof of Funds Letter", category: "Financial", status: "UPLOADED", issuingAuthority: "Bank", expiryDate: "2026-09-01", uploadedVersion: "v1", aiReviewed: true },
]

const categories = ["Identity", "Education", "Language", "Employment", "Financial", "Legal", "Medical"]

interface ExpandedDoc {
  [key: string]: boolean
}

export default function DocumentsPage() {
  const [expanded, setExpanded] = useState<ExpandedDoc>({})
  const [filterCategory, setFilterCategory] = useState<string>("ALL")

  const uploaded = documents.filter((d) => d.status !== "NOT_UPLOADED").length
  const approved = documents.filter((d) => d.status === "APPROVED").length

  const filtered = filterCategory === "ALL"
    ? documents
    : documents.filter((d) => d.category === filterCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">{uploaded} of {documents.length} uploaded · {approved} approved</p>
        </div>
        <Button>
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory("ALL")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            filterCategory === "ALL" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filterCategory === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Progress overview */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overall</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((uploaded / documents.length) * 100)}%
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
          <ProgressBar progress={(uploaded / documents.length) * 100} size="sm" className="mt-2" />
        </Card>
        <Card className="border-green-200 dark:border-green-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approved}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="border-yellow-200 dark:border-yellow-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {documents.filter((d) => d.status === "UPLOADED" || d.status === "REVIEWING").length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="border-red-200 dark:border-red-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Missing</p>
              <p className="text-2xl font-bold text-red-600">
                {documents.filter((d) => d.status === "NOT_UPLOADED").length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Documents List */}
      {categories.map((category) => {
        const catDocs = filtered.filter((d) => d.category === category)
        if (catDocs.length === 0) return null

        return (
          <Card key={category}>
            <CardTitle>{category} Documents</CardTitle>
            <CardDescription>
              {catDocs.filter((d) => d.status === "APPROVED").length} of {catDocs.length} approved
            </CardDescription>
            <div className="mt-4 space-y-3">
              {catDocs.map((doc) => (
                <div key={doc.id}>
                  <div
                    className="flex items-center gap-4 rounded-lg border border-gray-100 p-4 transition-colors hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700 cursor-pointer"
                    onClick={() => setExpanded({ ...expanded, [doc.id]: !expanded[doc.id] })}
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      doc.status === "APPROVED" ? "bg-green-100 text-green-600" :
                      doc.status === "NOT_UPLOADED" ? "bg-gray-100 text-gray-400 dark:bg-gray-800" :
                      "bg-blue-100 text-blue-600"
                    }`}>
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{doc.name}</p>
                        <Badge variant={
                          doc.status === "APPROVED" ? "success" :
                          doc.status === "REVIEWING" ? "info" :
                          doc.status === "NOT_UPLOADED" ? "outline" :
                          "warning"
                        }>
                          {getStatusLabel(doc.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{doc.issuingAuthority}</p>
                    </div>

                    <div className="text-right text-xs text-gray-500">
                      {doc.expiryDate && (
                        <div className="flex items-center gap-1">
                          {daysUntil(doc.expiryDate) < 180 && daysUntil(doc.expiryDate) > 0 ? (
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          ) : null}
                          <span>Exp: {formatDate(doc.expiryDate)}</span>
                        </div>
                      )}
                      {doc.uploadedVersion && <span>v{doc.uploadedVersion}</span>}
                    </div>

                    <div className="flex items-center gap-1">
                      {doc.status === "NOT_UPLOADED" ? (
                        <Button size="sm" variant="outline">
                          <Upload className="h-3 w-3" />
                        </Button>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {expanded[doc.id] && (
                    <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Purpose</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Proof of identity required for all IRCC applications</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Issuing Authority</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{doc.issuingAuthority}</p>
                        </div>
                        {doc.expiryDate && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Expiry</p>
                            <p className={`text-sm ${daysUntil(doc.expiryDate) < 180 ? "text-red-600" : "text-gray-700 dark:text-gray-300"}`}>
                              {formatDate(doc.expiryDate)} ({daysUntil(doc.expiryDate)} days)
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">AI Review</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {doc.aiReviewed ? "✓ Passed" : "Not reviewed yet"}
                          </p>
                        </div>
                      </div>

                      {doc.status === "NOT_UPLOADED" && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                          <Info className="h-4 w-4 text-blue-500" />
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Upload a color scan of the bio page. Ensure all details are clearly visible. Max 4MB, PDF or JPG.
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        <Button size="sm">
                          <Upload className="h-3 w-3" />
                          {doc.status === "NOT_UPLOADED" ? "Upload" : "Upload New Version"}
                        </Button>
                        <Button size="sm" variant="outline">View Sample</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
