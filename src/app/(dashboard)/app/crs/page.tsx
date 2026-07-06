"use client"

import { useState } from "react"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { calculateCRS, whatIfCRS, identifyOpportunities } from "@/lib/crs-engine"
import { ArrowRight, Sparkles, TrendingUp, Target, BarChart3 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import type { CRSBreakdown, CRSOpportunity, WhatIfChange, LanguageScores } from "@/types"

export default function CRSPage() {
  const [age, setAge] = useState(29)
  const [education, setEducation] = useState("MASTERS")
  const [listening, setListening] = useState(7.5)
  const [reading, setReading] = useState(7.0)
  const [writing, setWriting] = useState(6.5)
  const [speaking, setSpeaking] = useState(7.0)
  const [canadianExp, setCanadianExp] = useState(0)
  const [foreignExp, setForeignExp] = useState(3)
  const [includeFrench, setIncludeFrench] = useState(false)
  const [selectedWhatIf, setSelectedWhatIf] = useState<string | null>(null)

  const firstLang: LanguageScores = { listening, reading, writing, speaking }

  const input = {
    age,
    educationLevel: education,
    firstLanguage: firstLang,
    secondLanguage: includeFrench ? { listening: 7, reading: 7, writing: 7, speaking: 7 } : undefined,
    canadianWorkExperienceYears: canadianExp,
    foreignWorkExperienceYears: foreignExp,
    hasPNPNomination: false,
    hasJobOfferLMIA: false,
    hasCanadianEducation: false,
    hasCanadianSibling: false,
    hasFrenchAbility: includeFrench,
  }

  const crs = calculateCRS(input)
  const opportunities = identifyOpportunities(input)

  const targetScore = 470
  const gap = targetScore - crs.totalScore

  const whatIfScenarios: { id: string; label: string; changes: WhatIfChange[] }[] = [
    { id: "clb9", label: "Improve IELTS to CLB 9", changes: [{ field: "firstLanguage.targetCLB9", value: 8, label: "" }] },
    { id: "clb10", label: "Improve IELTS to CLB 10", changes: [{ field: "firstLanguage.targetCLB9", value: 9, label: "" }] },
    { id: "french", label: "Add French NCLC 7", changes: [{ field: "secondLanguage.add", value: true, label: "" }] },
    { id: "masters", label: "Complete Master's", changes: [{ field: "educationLevel", value: "MASTERS", label: "" }] },
    { id: "phd", label: "Complete PhD", changes: [{ field: "educationLevel", value: "PHD", label: "" }] },
    { id: "extra-year", label: "1 More Year Experience", changes: [{ field: "foreignWorkExperience", value: 4, label: "" }] },
    { id: "pnp", label: "Provincial Nomination", changes: [{ field: "pnp", value: true, label: "" }] },
    { id: "job-offer", label: "Job Offer (LMIA)", changes: [{ field: "jobOffer", value: true, label: "" }] },
  ]

  const chartData = crs.breakdown.filter((f) => f.maxScore > 0).map((f) => ({
    name: f.label,
    score: f.score,
    max: f.maxScore,
    fill: f.score / f.maxScore >= 0.8 ? "#22c55e" : f.score / f.maxScore >= 0.5 ? "#3b82f6" : "#f59e0b",
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CRS Calculator</h1>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive Ranking System — decision support for Express Entry
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardTitle>Your Profile</CardTitle>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
              <input type="range" min={18} max={45} value={age} onChange={(e) => setAge(Number(e.target.value))}
                className="mt-1 w-full" />
              <span className="text-sm text-gray-500">{age} years</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Education</label>
              <select value={education} onChange={(e) => setEducation(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                <option value="HIGH_SCHOOL">High School</option>
                <option value="DIPLOMA_1_YEAR">1-Year Diploma</option>
                <option value="DIPLOMA_2_YEAR">2-Year Diploma</option>
                <option value="DIPLOMA_3_YEAR">3-Year Diploma</option>
                <option value="BACHELORS">Bachelor's Degree</option>
                <option value="MASTERS">Master's Degree</option>
                <option value="PHD">PhD</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Language (IELTS)</p>
              {["Listening", "Reading", "Writing", "Speaking"].map((skill) => (
                <div key={skill} className="flex items-center gap-2 mb-1">
                  <span className="w-20 text-xs text-gray-500">{skill}</span>
                  <input type="range" min={4} max={9} step={0.5}
                    value={skill === "Listening" ? listening : skill === "Reading" ? reading : skill === "Writing" ? writing : speaking}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      if (skill === "Listening") setListening(v)
                      else if (skill === "Reading") setReading(v)
                      else if (skill === "Writing") setWriting(v)
                      else setSpeaking(v)
                    }}
                    className="flex-1" />
                  <span className="w-8 text-xs font-medium">
                    {skill === "Listening" ? listening : skill === "Reading" ? reading : skill === "Writing" ? writing : speaking}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Work Experience</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-500">Canadian (years)</span>
                  <input type="number" min={0} max={5} value={canadianExp} onChange={(e) => setCanadianExp(Number(e.target.value))}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
                </div>
                <div>
                  <span className="text-xs text-gray-500">Foreign (years)</span>
                  <input type="number" min={0} max={10} value={foreignExp} onChange={(e) => setForeignExp(Number(e.target.value))}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={includeFrench} onChange={(e) => setIncludeFrench(e.target.checked)}
                className="rounded border-gray-300" />
              <span>French proficiency (NCLC 7)</span>
            </label>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-6 lg:col-span-2">
          {/* Score */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your CRS Score</CardTitle>
                <CardDescription>Current vs Target</CardDescription>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>

            <div className="mt-6 flex items-end justify-center gap-8">
              <div className="text-center">
                <p className="text-sm text-gray-500">Current</p>
                <p className={`text-5xl font-bold ${gap > 0 ? "text-yellow-500" : "text-green-500"}`}>
                  {crs.totalScore}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Target</p>
                <p className="text-5xl font-bold text-gray-300 dark:text-gray-600">{targetScore}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Gap</p>
                <p className={`text-5xl font-bold ${gap > 0 ? "text-red-500" : "text-green-500"}`}>
                  {gap > 0 ? `-${gap}` : "+" + Math.abs(gap)}
                </p>
              </div>
            </div>

            <ProgressBar progress={(crs.totalScore / targetScore) * 100} size="lg" className="mt-6" barClassName={gap > 0 ? "bg-orange-500" : "bg-green-500"} />
          </Card>

          {/* Breakdown Chart */}
          <Card>
            <CardTitle>Score Breakdown</CardTitle>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 600]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip formatter={(value) => `${value} points`} />
                  <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {crs.breakdown.map((factor) => (
                <div key={factor.category} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{factor.label}</span>
                  <div className="flex items-center gap-2">
                    <ProgressBar progress={(factor.score / factor.maxScore) * 100} size="sm" className="w-32" />
                    <span className="w-20 text-right font-medium">
                      {factor.score}/{factor.maxScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* What-If Scenarios */}
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              What If...
            </CardTitle>
            <CardDescription>See how specific improvements would change your score</CardDescription>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {whatIfScenarios.map((scenario) => {
                const projection = whatIfCRS(input, scenario.changes)
                const isSelected = selectedWhatIf === scenario.id
                return (
                  <div
                    key={scenario.id}
                    className={`rounded-lg border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 hover:border-blue-300 dark:border-gray-700"
                    }`}
                    onClick={() => setSelectedWhatIf(isSelected ? null : scenario.id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{scenario.label}</p>
                      <Badge variant={projection.pointsGained > 0 ? "success" : "outline"}>
                        {projection.pointsGained > 0 ? `+${projection.pointsGained}` : "No change"}
                      </Badge>
                    </div>
                    {isSelected && (
                      <div className="mt-3 space-y-2 text-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                          Current: <strong>{projection.currentScore}</strong>
                          <ArrowRight className="mx-2 inline h-3 w-3" />
                          New: <strong>{projection.newScore}</strong>
                        </p>
                        {projection.wouldQualify && (
                          <Badge variant="success">Would qualify! 🎯</Badge>
                        )}
                        {!projection.wouldQualify && projection.cutoffComparison && (
                          <p className="text-yellow-600">
                            Still {Math.abs(projection.cutoffComparison.gap)} points below cutoff
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Opportunities */}
          <Card>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Improvement Opportunities
            </CardTitle>
            <CardDescription>Ranked by points gained vs effort</CardDescription>
            <div className="mt-4 space-y-3">
              {opportunities.slice(0, 6).map((opp) => (
                <div key={opp.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{opp.label}</p>
                      <Badge variant={opp.difficulty === "EASY" ? "success" : opp.difficulty === "MODERATE" ? "info" : "warning"}>
                        {opp.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{opp.estimatedEffort} · {opp.description}</p>
                  </div>
                  <Badge variant="success" className="text-base font-bold">+{opp.pointsGained}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
