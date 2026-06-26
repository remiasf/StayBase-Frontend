"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, MapPin, Star, UserRound } from "lucide-react"
import { useParams } from "next/navigation"
import { DayPicker, type DateRange } from "react-day-picker"
import { differenceInCalendarDays, format } from "date-fns"
import "react-day-picker/style.css"

interface Apartment {
  id: string
  title: string
  description: string
  images: string[]
  city: string
  address: string
  latitude: number
  longitude: number
  price: number
  currency: string
  priceUsd: number
  discountPercent: number
  size: number
  rooms: number
  maxGuests: number
  createdAt: string
  updatedAt: string
  userId: string
}

const formatMoney = (value: number, currency: string) =>
  `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} ${currency}`

function ApartmentDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#d1fae5_0%,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse space-y-7">
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
            <div className="h-[340px] rounded-xl bg-slate-200 sm:h-[420px]" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-[165px] rounded-xl bg-slate-200 sm:h-[205px]" />
              <div className="h-[165px] rounded-xl bg-slate-200 sm:h-[205px]" />
              <div className="h-[165px] rounded-xl bg-slate-200 sm:h-[205px]" />
              <div className="h-[165px] rounded-xl bg-slate-200 sm:h-[205px]" />
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <div className="h-6 w-44 rounded-full bg-slate-200" />
            <div className="h-10 w-80 rounded-xl bg-slate-200" />
            <div className="h-5 w-64 rounded-lg bg-slate-200" />
            <div className="h-5 w-96 rounded-lg bg-slate-200" />
            <div className="h-14 w-full rounded-xl bg-slate-200" />
            <div className="h-32 w-full rounded-xl bg-slate-200" />
          </div>

          <div className="h-[520px] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5" />
        </section>
      </div>
    </main>
  )
}

export default function ApartmentDetailsPage() {
  const params = useParams<{ id: string }>()
  const apartmentId = Array.isArray(params?.id) ? params.id[0] : params?.id

  const [apartment, setApartment] = useState<Apartment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>()

  const parseApartment = (payload: unknown): Apartment => {
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as { data: Apartment }).data
    }

    return payload as Apartment
  }

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    async function fetchApartment() {
      if (!apartmentId) {
        setError("Apartment id is missing in the URL")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "https://staybase.software"

        const url = `${apiBase}/apartments/${apartmentId}`
        const response = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
        })

        if (!response.ok) {
          const errorBody = await response.text()
          const details = errorBody?.slice(0, 200) || "No response body"
          throw new Error(`Failed to load apartment (${response.status} ${response.statusText}): ${details}`)
        }

        const rawData = await response.json()
        const data = parseApartment(rawData)

        if (!isActive) {
          return
        }

        setApartment(data)
      } catch (err) {
        if (!isActive || (err instanceof DOMException && err.name === "AbortError")) {
          return
        }

        setError(err instanceof Error ? err.message : "Unknown error while loading apartment")
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchApartment()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [apartmentId])

  const gallery = useMemo(() => {
    if (!apartment?.images?.length) {
      return [] as string[]
    }

    const [firstImage, ...otherImages] = apartment.images
    const sideImages = [...otherImages]
    while (sideImages.length < 4) {
      sideImages.push(firstImage)
    }

    return [firstImage, ...sideImages.slice(0, 4)]
  }, [apartment])

  const nights = useMemo(() => {
    if (!selectedRange?.from || !selectedRange?.to) {
      return 0
    }

    return Math.max(differenceInCalendarDays(selectedRange.to, selectedRange.from), 0)
  }, [selectedRange])

  if (loading) {
    return <ApartmentDetailsSkeleton />
  }

  if (error || !apartment) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#d1fae5_0%,_#f8fafc_45%,_#ffffff_100%)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6 shadow-lg shadow-red-900/5">
          <h1 className="text-xl font-semibold text-slate-900">Unable to load apartment</h1>
          <p className="mt-2 text-sm text-red-700">{error ?? "Apartment was not found"}</p>
          <p className="mt-3 text-sm text-slate-500">Please check the apartment URL or try again later.</p>
        </div>
      </main>
    )
  }

  const hasDiscount = apartment.discountPercent > 0
  const originalNightPrice = hasDiscount
    ? Math.round(apartment.price / (1 - apartment.discountPercent / 100))
    : apartment.price
  const subtotal = nights * apartment.price
  const fallbackImage = "/tokyo.avif"
  const coverImage = gallery[0] ?? fallbackImage
  const sideImages = gallery.length > 1 ? gallery.slice(1, 5) : [fallbackImage, fallbackImage, fallbackImage, fallbackImage]

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#d1fae5_0%,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
            <div className="overflow-hidden rounded-xl">
              <img
                src={coverImage}
                alt={apartment.title}
                className="h-[340px] w-full object-cover sm:h-[420px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {sideImages.map((imageUrl, index) => (
                <div key={`${imageUrl}-${index}`} className="overflow-hidden rounded-xl">
                  <img
                    src={imageUrl}
                    alt={`${apartment.title} ${index + 2}`}
                    className="h-[165px] w-full object-cover sm:h-[205px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <article className="space-y-6">
            <header className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Star className="size-3.5 fill-emerald-500 text-emerald-500" />
                Guest favorite in {apartment.city}
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{apartment.title}</h1>

              <div className="space-y-1.5 text-slate-600">
                <p className="text-lg font-medium text-slate-700">{apartment.city}</p>
                <p className="inline-flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="size-4 text-slate-500" />
                  {apartment.address}
                </p>
              </div>
            </header>

            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1">
                <UserRound className="size-4 text-slate-500" />
                {apartment.maxGuests} guests
              </span>
              <span className="text-slate-400">•</span>
              <span className="rounded-full bg-white px-3 py-1">{apartment.rooms} bedroom</span>
              <span className="text-slate-400">•</span>
              <span className="rounded-full bg-white px-3 py-1">{apartment.size} sq.m.</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">About this place</h2>
              <p className="leading-relaxed text-slate-700">{apartment.description}</p>
            </div>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
              <div className="mb-5 flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Price per night</p>
                  {hasDiscount ? (
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400 line-through">
                        {formatMoney(originalNightPrice, apartment.currency)}
                      </p>
                      <p className="text-2xl font-semibold text-slate-900">{formatMoney(apartment.price, apartment.currency)}</p>
                    </div>
                  ) : (
                    <p className="text-2xl font-semibold text-slate-900">{formatMoney(apartment.price, apartment.currency)}</p>
                  )}
                  <p className="text-xs text-slate-500">Approx. ${apartment.priceUsd} USD / night</p>
                </div>
                {hasDiscount && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    -{apartment.discountPercent}%
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CalendarDays className="size-4" />
                  Select dates
                </p>
                <DayPicker
                  mode="range"
                  selected={selectedRange}
                  onSelect={setSelectedRange}
                  showOutsideDays
                  className="mx-auto"
                  classNames={{
                    selected: "bg-emerald-600 text-white",
                    today: "text-emerald-700 font-semibold",
                    range_start: "bg-emerald-600 text-white rounded-l-md",
                    range_end: "bg-emerald-600 text-white rounded-r-md",
                    range_middle: "bg-emerald-100 text-emerald-900",
                    chevron: "fill-slate-600",
                  }}
                />
              </div>

              <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Nights</span>
                  <span>{nights}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>
                    {formatMoney(apartment.price, apartment.currency)} x {nights}
                  </span>
                  <span>{formatMoney(subtotal, apartment.currency)}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal, apartment.currency)}</span>
                </div>
                {selectedRange?.from && selectedRange?.to && (
                  <p className="pt-1 text-xs text-slate-500">
                    {format(selectedRange.from, "MMM d, yyyy")} - {format(selectedRange.to, "MMM d, yyyy")}
                  </p>
                )}
              </div>

              <button
                type="button"
                className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={nights === 0}
              >
                Reserve
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
