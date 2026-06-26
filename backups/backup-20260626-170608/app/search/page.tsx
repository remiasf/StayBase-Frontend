"use client"

import { Suspense } from "react"
import { SearchResultsView } from "./SearchResultsView"

export default function SearchPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<div className="text-center py-12">Search initialization</div>}>
        <SearchResultsView />
      </Suspense>
    </div>
  )
}