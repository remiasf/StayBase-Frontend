"use client"

import ApartmentCard from "@/components/cards/ApartmentCard"
import { useEffect, useMemo, useState } from "react"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { FilterForm } from "./form"

interface Apartment {
  id: string
  title: string
  description: string
  images: string[]
  size: number
  rooms: number
  maxGuests: number
  price: number
  priceUsd: number
  currency: string
  discountPercent: number
  city: string
  address: string
  latitude: number
  longitude: number
}

interface Meta {
  total: number
  page: number
  lastPage: number
}

export function SearchResultsView() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const queryString = searchParams.toString()
  const currentPage = Number(searchParams.get("page")) || 1
  const router = useRouter()
  const params = useParams<{ address?: string }>()

  const routeAddress = useMemo(() => {
    const raw = Array.isArray(params?.address) ? params.address[0] : params?.address
    return raw ? decodeURIComponent(raw) : ""
  }, [params?.address])

  const [apartments, setApartments] = useState<Apartment[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApartments() {
      setLoading(true)
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL
        if (!apiBase) {
          throw new Error("Missing NEXT_PUBLIC_API_URL environment variable")
        }

        const backendParams = new URLSearchParams(queryString)
        backendParams.set("page", currentPage.toString())

        if (routeAddress) {
          backendParams.set("address", routeAddress)
        }

        const finalUrl = new URL(`/apartments?${backendParams.toString()}`, apiBase).toString()

        const response = await fetch(finalUrl, { cache: "no-store" })

        if (!response.ok) {
          const errorBody = await response.text()
          const backendDetails = errorBody?.slice(0, 200) || "No response body"
          throw new Error(`Error while loading (${response.status} ${response.statusText}): ${backendDetails}`)
        }

        const result = await response.json()
        setApartments(result.data || [])
        setMeta(result.meta || null)
        setErrorMessage(null)
      } catch (error) {
        setApartments([])
        setMeta(null)
        setErrorMessage(error instanceof Error ? error.message : "Unknown backend error")
      } finally {
        setLoading(false)
      }
    }

    fetchApartments()
  }, [currentPage, queryString, routeAddress])

  const handlePageChange = (newPage: number) => {
    const paramsForPage = new URLSearchParams(searchParams.toString())
    paramsForPage.set("page", newPage.toString())
    router.push(`${pathname}?${paramsForPage.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="h-fit w-full self-start rounded-xl border bg-white p-4 md:w-72 md:flex-none md:shrink-0">
        <h2 className="mb-4 font-semibold">Filters</h2>
        <FilterForm initialAddress={routeAddress} />
      </div>

      <div className="flex flex-grow flex-col gap-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Searching...</div>
        ) : errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
        ) : apartments.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Nothing found :(</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {apartments.map((item) => (
                <ApartmentCard key={item.id} apartment={item} />
              ))}
            </div>

            {meta && meta.lastPage > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border px-4 py-2 disabled:opacity-50"
                >
                  Back
                </button>
                <span className="text-sm font-medium">
                  Page {currentPage} from {meta.lastPage}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === meta.lastPage}
                  className="rounded-lg border px-4 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
