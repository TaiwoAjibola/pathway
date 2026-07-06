"use client"

import { useEffect, useState } from "react"

type StageProgress = {
  id: string
  status: string
  progress: number
  stage: { id: string; code: string; name: string; order: number }
}

type Application = {
  id: string
  label: string
  status: string
  crsScore: number
  targetCrsScore: number
  healthScore: number
  readinessScore: number
  currentStageId: string | null
  estimatedCompletionDate: string | null
  daysRemaining: number
  journeyVelocity: number
  pathway: { name: string; visaCategory: string; config: Record<string, unknown> }
  applicants: Array<{ id: string; firstName: string; lastName: string; type: string }>
  stageProgress: StageProgress[]
  taskInstances: Array<Record<string, unknown>>
  crsSnapshots: Array<{ totalScore: number; breakdown: unknown }>
}

export function useApplication() {
  const [data, setData] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/application")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, setData }
}

export function useApplicant() {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/applicant")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, setData }
}

export function useLanguageTests() {
  const [data, setData] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)

  const refresh = () => {
    fetch("/api/language")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(refresh, [])
  return { data, loading, refresh }
}
