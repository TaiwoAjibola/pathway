import type { CRSBreakdown, CRSOpportunity, CRSProjection, WhatIfChange, LanguageScores } from "@/types"

interface CRSInput {
  age: number
  educationLevel: string
  firstLanguage: LanguageScores
  secondLanguage?: LanguageScores
  canadianWorkExperienceYears: number
  foreignWorkExperienceYears: number
  hasPNPNomination: boolean
  hasJobOfferLMIA: boolean
  hasCanadianEducation: boolean
  hasCanadianSibling: boolean
  hasFrenchAbility: boolean
  spouseEducation?: string
  spouseLanguage?: LanguageScores
  spouseCanadianWork?: boolean
}

const AGE_SCORES: Record<number, number> = {
  18: 90, 19: 95, 20: 100, 21: 105, 22: 110, 23: 115, 24: 120,
  25: 125, 26: 130, 27: 135, 28: 140, 29: 145, 30: 140, 31: 135,
  32: 130, 33: 125, 34: 120, 35: 110, 36: 100, 37: 90, 38: 80,
  39: 70, 40: 60, 41: 50, 42: 40, 43: 30, 44: 20, 45: 10,
}

const EDUCATION_SCORES: Record<string, number> = {
  PHD: 150,
  MASTERS: 135,
  BACHELORS: 120,
  DIPLOMA_3_YEAR: 98,
  DIPLOMA_2_YEAR: 91,
  DIPLOMA_1_YEAR: 84,
  HIGH_SCHOOL: 30,
}

const CLB_TO_POINTS: Record<number, { perAbility: number; total: number }> = {
  4: { perAbility: 4, total: 16 },
  5: { perAbility: 5, total: 20 },
  6: { perAbility: 6, total: 24 },
  7: { perAbility: 7, total: 28 },
  8: { perAbility: 8, total: 32 },
  9: { perAbility: 9, total: 36 },
  10: { perAbility: 9, total: 36 },
}

function clbFromIELTS(score: number): number {
  if (score >= 9.0) return 10
  if (score >= 8.0) return 9
  if (score >= 7.5) return 8
  if (score >= 7.0) return 7
  if (score >= 6.5) return 6
  if (score >= 6.0) return 5
  if (score >= 5.5) return 4
  return 3
}

function clbFromCELPIP(score: number): number {
  return Math.min(10, Math.floor(score))
}

function calculateLanguagePoints(scores: LanguageScores, isFirstLanguage: boolean): number {
  const abilities = [scores.listening, scores.reading, scores.writing, scores.speaking]
  let total = 0
  for (const score of abilities) {
    const clb = clbFromIELTS(score)
    const points = CLB_TO_POINTS[clb]?.perAbility || 0
    total += points
  }
  return total
}

function calculateSecondLanguagePoints(scores?: LanguageScores): number {
  if (!scores) return 0
  const abilities = [scores.listening, scores.reading, scores.writing, scores.speaking]
  let total = 0
  for (const score of abilities) {
    if (score >= 5.0) total += 1
    if (score >= 7.0) total += 1
  }
  return Math.min(total, 24)
}

function calculateSkillsTransfer(
  educationLevel: string,
  firstLanguageCLB: number,
  canadianWorkYears: number,
  foreignWorkYears: number
): number {
  let score = 0
  const hasHighCLB9 = firstLanguageCLB >= 9
  const hasHighCLB7 = firstLanguageCLB >= 7
  const highEdu = educationLevel === "PHD" || educationLevel === "MASTERS"
  const midEdu = educationLevel === "BACHELORS" || educationLevel.startsWith("DIPLOMA")

  if (highEdu && hasHighCLB9) score += 50
  else if (highEdu && hasHighCLB7) score += 25
  else if (midEdu && hasHighCLB9) score += 50
  else if (midEdu && hasHighCLB7) score += 13

  if (canadianWorkYears >= 2 && hasHighCLB9) score += 50
  else if (canadianWorkYears >= 2 && hasHighCLB7) score += 25
  else if (canadianWorkYears >= 1 && hasHighCLB9) score += 25
  else if (canadianWorkYears >= 1 && hasHighCLB7) score += 13

  if (foreignWorkYears >= 3 && hasHighCLB9) score += 50
  else if (foreignWorkYears >= 3 && hasHighCLB7) score += 25
  else if (foreignWorkYears >= 1 && hasHighCLB9) score += 25
  else if (foreignWorkYears >= 1 && hasHighCLB7) score += 13

  return Math.min(score, 100)
}

export function calculateCRS(input: CRSInput): CRSBreakdown {
  const ageScore = AGE_SCORES[input.age] || 0
  const educationScore = EDUCATION_SCORES[input.educationLevel] || 0

  const firstLangTotal = calculateLanguagePoints(input.firstLanguage, true)
  const secondLangTotal = calculateSecondLanguagePoints(input.secondLanguage)

  const workExpScore = Math.min(input.canadianWorkExperienceYears * 10, 80)

  const totalAbilities = [input.firstLanguage.listening, input.firstLanguage.reading, input.firstLanguage.writing, input.firstLanguage.speaking]
  const avgCLB = Math.round(totalAbilities.reduce((a, b) => a + clbFromIELTS(b), 0) / 4)

  const skillsTransfer = calculateSkillsTransfer(input.educationLevel, avgCLB, input.canadianWorkExperienceYears, input.foreignWorkExperienceYears)

  let additionalScore = 0
  if (input.hasPNPNomination) additionalScore += 600
  if (input.hasJobOfferLMIA) additionalScore += 50
  if (input.hasCanadianEducation) additionalScore += 30
  if (input.hasCanadianSibling) additionalScore += 15
  if (input.hasFrenchAbility && input.secondLanguage) additionalScore += 50

  const total = ageScore + educationScore + firstLangTotal + secondLangTotal + workExpScore + skillsTransfer + additionalScore

  return {
    totalScore: total,
    ageScore,
    educationScore,
    firstLanguageScore: firstLangTotal,
    secondLanguageScore: secondLangTotal,
    workExperienceScore: workExpScore,
    skillsTransferScore: skillsTransfer,
    additionalScore,
    maxPossible: 1200,
    breakdown: [
      { category: "age", label: "Age", score: ageScore, maxScore: 110 },
      { category: "education", label: "Education", score: educationScore, maxScore: 150 },
      { category: "firstLanguage", label: "First Language", score: firstLangTotal, maxScore: 136 },
      { category: "secondLanguage", label: "Second Language", score: secondLangTotal, maxScore: 24 },
      { category: "workExperience", label: "Work Experience", score: workExpScore, maxScore: 80 },
      { category: "skillsTransfer", label: "Skills Transfer", score: skillsTransfer, maxScore: 100 },
      { category: "additional", label: "Additional Points", score: additionalScore, maxScore: 600 },
    ],
  }
}

export function whatIfCRS(current: CRSInput, changes: WhatIfChange[]): CRSProjection {
  const modified = { ...current }
  const changeDescriptions: WhatIfChange[] = []

  for (const change of changes) {
    switch (change.field) {
      case "educationLevel":
        modified.educationLevel = String(change.value)
        changeDescriptions.push({ field: "educationLevel", value: change.value, label: `Education → ${change.value}` })
        break
      case "firstLanguage.improve":
        const improvement = Number(change.value)
        modified.firstLanguage = {
          listening: Math.min(9, (modified.firstLanguage.listening || 0) + improvement),
          reading: Math.min(9, (modified.firstLanguage.reading || 0) + improvement),
          writing: Math.min(9, (modified.firstLanguage.writing || 0) + improvement),
          speaking: Math.min(9, (modified.firstLanguage.speaking || 0) + improvement),
        }
        changeDescriptions.push({ field: "firstLanguage.improve", value: change.value, label: `Improve language by ${improvement}` })
        break
      case "firstLanguage.targetCLB9":
        const target = Number(change.value)
        modified.firstLanguage = { listening: target, reading: target, writing: target, speaking: target }
        changeDescriptions.push({ field: "firstLanguage.targetCLB9", value: change.value, label: `Language → CLB ${target}` })
        break
      case "secondLanguage.add":
        modified.secondLanguage = { listening: 7, reading: 7, writing: 7, speaking: 7 }
        modified.hasFrenchAbility = true
        changeDescriptions.push({ field: "secondLanguage.add", value: true, label: "Add French (NCLC 7)" })
        break
      case "foreignWorkExperience":
        modified.foreignWorkExperienceYears = Number(change.value)
        changeDescriptions.push({ field: "foreignWorkExperience", value: change.value, label: `Foreign work: ${change.value} years` })
        break
      case "canadianWorkExperience":
        modified.canadianWorkExperienceYears = Number(change.value)
        changeDescriptions.push({ field: "canadianWorkExperience", value: change.value, label: `Canadian work: ${change.value} years` })
        break
      case "pnp":
        modified.hasPNPNomination = Boolean(change.value)
        changeDescriptions.push({ field: "pnp", value: change.value, label: "Provincial Nomination" })
        break
      case "jobOffer":
        modified.hasJobOfferLMIA = Boolean(change.value)
        changeDescriptions.push({ field: "jobOffer", value: change.value, label: "Job Offer (LMIA)" })
        break
    }
  }

  const currentResult = calculateCRS(current)
  const newResult = calculateCRS(modified)

  return {
    currentScore: currentResult.totalScore,
    newScore: newResult.totalScore,
    pointsGained: newResult.totalScore - currentResult.totalScore,
    changes: changeDescriptions,
    wouldQualify: newResult.totalScore >= 470,
    cutoffComparison: {
      cutoff: 470,
      gap: 470 - newResult.totalScore,
    },
  }
}

export function identifyOpportunities(input: CRSInput): CRSOpportunity[] {
  const current = calculateCRS(input)
  const opportunities: CRSOpportunity[] = []
  const currentScore = current.totalScore

  if (input.educationLevel !== "PHD") {
    const phdProjection = whatIfCRS(input, [{ field: "educationLevel", value: "PHD", label: "" }])
    opportunities.push({
      id: "phd",
      label: "Complete PhD",
      description: "Earn a doctoral degree",
      pointsGained: phdProjection.pointsGained,
      estimatedEffort: "3-5 years",
      difficulty: "HARD",
      confidence: "MEDIUM",
    })
  }

  if (input.educationLevel === "BACHELORS" || input.educationLevel === "DIPLOMA_3_YEAR") {
    const mastersProjection = whatIfCRS(input, [{ field: "educationLevel", value: "MASTERS", label: "" }])
    opportunities.push({
      id: "masters",
      label: "Complete Master's Degree",
      description: "Earn a master's degree",
      pointsGained: mastersProjection.pointsGained,
      estimatedEffort: "1-2 years",
      difficulty: "HARD",
      confidence: "MEDIUM",
    })
  }

  const avgScore = Object.values(input.firstLanguage).reduce((a, b) => a + b, 0) / 4
  if (avgScore < 8) {
    const ieltsProjection = whatIfCRS(input, [{ field: "firstLanguage.targetCLB9", value: 8, label: "" }])
    if (ieltsProjection.pointsGained > 0) {
      opportunities.push({
        id: "ielts-clb9",
        label: "Improve IELTS to CLB 9",
        description: "Score 8.0+ in each IELTS band",
        pointsGained: ieltsProjection.pointsGained,
        estimatedEffort: "2-3 months",
        difficulty: "MODERATE",
        confidence: "HIGH",
      })
    }
  }

  if (avgScore < 9) {
    const ielts10Projection = whatIfCRS(input, [{ field: "firstLanguage.targetCLB9", value: 9, label: "" }])
    if (ielts10Projection.pointsGained > 0) {
      opportunities.push({
        id: "ielts-clb10",
        label: "Improve IELTS to CLB 10",
        description: "Score 9.0+ in each IELTS band",
        pointsGained: ielts10Projection.pointsGained,
        estimatedEffort: "3-6 months",
        difficulty: "HARD",
        confidence: "MEDIUM",
      })
    }
  }

  if (!input.secondLanguage) {
    const frenchProjection = whatIfCRS(input, [{ field: "secondLanguage.add", value: true, label: "" }])
    if (frenchProjection.pointsGained > 0) {
      opportunities.push({
        id: "french",
        label: "Learn French (NCLC 7)",
        description: "Achieve NCLC 7 in French",
        pointsGained: frenchProjection.pointsGained,
        estimatedEffort: "6-12 months",
        difficulty: "HARD",
        confidence: "MEDIUM",
      })
    }
  }

  if (!input.hasPNPNomination) {
    opportunities.push({
      id: "pnp",
      label: "Provincial Nominee Program",
      description: "Get nominated by a Canadian province",
      pointsGained: 600,
      estimatedEffort: "3-6 months",
      difficulty: "COMPLEX",
      confidence: "LOW",
    })
  }

  if (!input.hasJobOfferLMIA && !input.hasPNPNomination) {
    opportunities.push({
      id: "lmia-job-offer",
      label: "Valid Job Offer (LMIA)",
      description: "Get a supported job offer",
      pointsGained: 50,
      estimatedEffort: "3-12 months",
      difficulty: "COMPLEX",
      confidence: "LOW",
    })
  }

  const extraYearProj = whatIfCRS(input, [{ field: "foreignWorkExperience", value: Math.min(6, input.foreignWorkExperienceYears + 1), label: "" }])
  if (extraYearProj.pointsGained > 0) {
    opportunities.push({
      id: "more-experience",
      label: "Gain 1 More Year Experience",
      description: "Continue working in skilled occupation",
      pointsGained: extraYearProj.pointsGained,
      estimatedEffort: "3-12 months",
      difficulty: "MODERATE",
      confidence: "HIGH",
    })
  }

  return opportunities.sort((a, b) => b.pointsGained - a.pointsGained)
}
