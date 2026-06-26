"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Expand, MapPin, Star, UserRound, X } from "lucide-react"
import { useParams } from "next/navigation"

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
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)

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
        const apiBase = process.env.NEXT_PUBLIC_API_URL;
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

        if (!isActive) return
        setApartment(data)
      } catch (err) {
        if (!isActive || (err instanceof DOMException && err.name === "AbortError")) return
        setError(err instanceof Error ? err.message : "Unknown error while loading apartment")
      } finally {
        if (isActive) setLoading(false)
      }
    }

    fetchApartment()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [apartmentId])

  const photos = useMemo(() => {
    if (!apartment?.images?.length) {
      return ["/tokyo.avif"]
    }

    return apartment.images
  }, [apartment])

  useEffect(() => {
    setCurrentPhotoIndex(0)
  }, [photos.length])

  const nights = 1

  useEffect(() => {
    if (!isFullscreenOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreenOpen(false)
      }

      if (event.key === "ArrowLeft") {
        setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
      }

      if (event.key === "ArrowRight") {
        setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isFullscreenOpen, photos.length])

  if (loading) return <ApartmentDetailsSkeleton />

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
  const activePhoto = photos[currentPhotoIndex] ?? photos[0]

  const showPreviousPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const showNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  const openFullscreen = () => {
    setIsFullscreenOpen(true)
  }

  const closeFullscreen = () => {
    setIsFullscreenOpen(false)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#d1fae5_0%,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur sm:p-4">
          <div className="mx-auto max-w-5xl space-y-3">
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={activePhoto}
                alt={apartment.title}
                className="h-[300px] w-full object-cover sm:h-[380px] lg:h-[420px]"
                onClick={openFullscreen}
              />

              <button
                type="button"
                onClick={showPreviousPhoto}
                className="absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow-md transition hover:bg-white"
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-5" />
              </button>

              <button
                type="button"
                onClick={showNextPhoto}
                className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow-md transition hover:bg-white"
                aria-label="Next photo"
              >
                <ChevronRight className="size-5" />
              </button>

              <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                {currentPhotoIndex + 1} / {photos.length}
              </div>

              <button
                type="button"
                onClick={openFullscreen}
                className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white transition hover:bg-black/75"
                aria-label="Open fullscreen photo"
              >
                <Expand className="size-3.5" />
                Fullscreen
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
              {photos.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  type="button"
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`overflow-hidden rounded-lg border-2 transition ${
                    index === currentPhotoIndex
                      ? "border-emerald-600 ring-2 ring-emerald-200"
                      : "border-transparent hover:border-slate-300"
                  }`}
                  aria-label={`Show photo ${index + 1}`}
                >
                  <img src={imageUrl} alt={`${apartment.title} thumbnail ${index + 1}`} className="h-16 w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {isFullscreenOpen && (
          <div className="fixed inset-0 z-50 bg-black/95">
            <button
              type="button"
              onClick={closeFullscreen}
              className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Close fullscreen"
            >
              <X className="size-5" />
            </button>

            <button
              type="button"
              onClick={showPreviousPhoto}
              className="absolute left-4 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-6" />
            </button>

            <button
              type="button"
              onClick={showNextPhoto}
              className="absolute right-4 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Next photo"
            >
              <ChevronRight className="size-6" />
            </button>

            <div className="flex h-full items-center justify-center px-16 py-10">
              <img
                src={activePhoto}
                alt={`${apartment.title} fullscreen`}
                className="max-h-full max-w-full rounded-xl object-contain"
              />
            </div>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white">
              {currentPhotoIndex + 1} / {photos.length}
            </div>
          </div>
        )}

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
                      <p className="text-2xl font-semibold text-slate-900">
                        {formatMoney(apartment.price, apartment.currency)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-2xl font-semibold text-slate-900">
                      {formatMoney(apartment.price, apartment.currency)}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">Approx. ${apartment.priceUsd} USD / night</p>
                </div>
                {hasDiscount && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    -{apartment.discountPercent}%
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Stay dates are selected in the main search flow.
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
              </div>

              <button
                type="button"
                className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={false}
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