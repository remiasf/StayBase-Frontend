"use client"

import { useState } from "react"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"
import { MapPin, SlidersHorizontal } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { filterSchema, initialFilters, type FilterSchema } from "./filter-schema"

type FilterFormProps = {
    initialAddress?: string
}

export function FilterForm({ initialAddress = "" }: FilterFormProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
        const [filters, setFilters] = useState<FilterSchema>({ ...initialFilters, address: initialAddress })
    const [validationError, setValidationError] = useState<string | null>(null)

    const updateRange = (key: "priceRange" | "sizeRange") => (value: number | number[]) => {
        if (!Array.isArray(value) || value.length !== 2) {
            return
        }

        setValidationError(null)
        setFilters((prev) => ({
            ...prev,
            [key]: [value[0], value[1]],
        }))
    }

    const updateRadius = (value: number | number[]) => {
        if (Array.isArray(value)) {
            return
        }

        setValidationError(null)
        setFilters((prev) => ({
            ...prev,
            radius: value,
        }))
    }

    const updateAddress = (value: string) => {
        setValidationError(null)
        setFilters((prev) => ({
            ...prev,
            address: value,
        }))
    }

    const applyFilters = () => {
        const parsedFilters = filterSchema.safeParse(filters)
        if (!parsedFilters.success) {
            setValidationError(parsedFilters.error.issues[0]?.message ?? "Invalid filter values")
            return
        }

        const params = new URLSearchParams(searchParams.toString())
        const validFilters = parsedFilters.data

        params.delete("address")

        params.set("minPrice", String(validFilters.priceRange[0]))
        params.set("maxPrice", String(validFilters.priceRange[1]))
        params.set("minSize", String(validFilters.sizeRange[0]))
        params.set("maxSize", String(validFilters.sizeRange[1]))
        params.set("radius", String(validFilters.radius))
        params.delete("beds")
        params.delete("bedrooms")
        params.delete("amenities")
        params.delete("page")

        setValidationError(null)

        const trimmedAddress = validFilters.address.trim()
        const targetPath = trimmedAddress ? `/search/${encodeURIComponent(trimmedAddress)}` : "/search"
        router.push(`${targetPath}?${params.toString()}`)
    }

    const resetFilters = () => {
        setValidationError(null)
        setFilters(initialFilters)
    }

    return (
        <section className="w-full rounded-2xl border border-slate-200 bg-gradient-to-b from-white via-slate-50 to-white p-4 shadow-sm sm:p-5">
            <div className="mb-5 flex items-center gap-2">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                    <SlidersHorizontal className="size-4" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-slate-900">Search Filters</h3>
                    <p className="text-xs text-slate-500">Tune your budget, space, and radius</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-800">Address</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                        <input
                            type="text"
                            value={filters.address}
                            onChange={(event) => updateAddress(event.target.value)}
                            placeholder="City, neighborhood, or full address"
                            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-800">Price range</p>
                        <p className="text-sm font-semibold text-slate-900">
                            ${filters.priceRange[0]} - ${filters.priceRange[1]}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                        <Slider
                            range
                            min={1}
                            max={500}
                            value={filters.priceRange}
                            onChange={updateRange("priceRange")}
                            className="staybase-range-slider !h-2"
                            railStyle={{
                                height: 8,
                                borderRadius: 9999,
                                background: "#e2e8f0",
                            }}
                            trackStyle={[
                                {
                                    height: 8,
                                    borderRadius: 9999,
                                    background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                                },
                            ]}
                            handleStyle={[
                                {
                                    height: 22,
                                    width: 22,
                                    marginTop: -7,
                                    border: "2px solid #059669",
                                    backgroundColor: "#ffffff",
                                    boxShadow: "0 0 0 6px rgba(16, 185, 129, 0.15)",
                                    opacity: 1,
                                },
                                {
                                    height: 22,
                                    width: 22,
                                    marginTop: -7,
                                    border: "2px solid #059669",
                                    backgroundColor: "#ffffff",
                                    boxShadow: "0 0 0 6px rgba(16, 185, 129, 0.15)",
                                    opacity: 1,
                                },
                            ]}
                        />
                    </div>
                </div>

                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-800">Size (m<sup>2</sup>)</p>
                        <p className="text-sm font-semibold text-slate-900">
                            {filters.sizeRange[0]} m2 - {filters.sizeRange[1]} m2
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                        <Slider
                            range
                            min={1}
                            max={200}
                            value={filters.sizeRange}
                            onChange={updateRange("sizeRange")}
                            className="staybase-range-slider !h-2"
                            railStyle={{
                                height: 8,
                                borderRadius: 9999,
                                background: "#e2e8f0",
                            }}
                            trackStyle={[
                                {
                                    height: 8,
                                    borderRadius: 9999,
                                    background: "linear-gradient(90deg, #14b8a6 0%, #0f766e 100%)",
                                },
                            ]}
                            handleStyle={[
                                {
                                    height: 22,
                                    width: 22,
                                    marginTop: -7,
                                    border: "2px solid #0f766e",
                                    backgroundColor: "#ffffff",
                                    boxShadow: "0 0 0 6px rgba(20, 184, 166, 0.15)",
                                    opacity: 1,
                                },
                                {
                                    height: 22,
                                    width: 22,
                                    marginTop: -7,
                                    border: "2px solid #0f766e",
                                    backgroundColor: "#ffffff",
                                    boxShadow: "0 0 0 6px rgba(20, 184, 166, 0.15)",
                                    opacity: 1,
                                },
                            ]}
                        />
                    </div>
                </div>

                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-800">Search radius</p>
                        <p className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                            <MapPin className="size-3.5" />
                            {filters.radius} km
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                        <Slider
                            min={1}
                            max={20}
                            value={filters.radius}
                            onChange={updateRadius}
                            className="staybase-range-slider !h-2"
                            railStyle={{
                                height: 8,
                                borderRadius: 9999,
                                background: "#e2e8f0",
                            }}
                            trackStyle={{
                                height: 8,
                                borderRadius: 9999,
                                background: "linear-gradient(90deg, #84cc16 0%, #4d7c0f 100%)",
                            }}
                            handleStyle={{
                                height: 22,
                                width: 22,
                                marginTop: -7,
                                border: "2px solid #4d7c0f",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 0 0 6px rgba(132, 204, 22, 0.15)",
                                opacity: 1,
                            }}
                        />
                    </div>
                </div>

                {validationError && <p className="text-sm text-red-600">{validationError}</p>}

                <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                    <Button type="button" variant="ghost" onClick={resetFilters} className="h-10 rounded-xl">
                        Reset
                    </Button>
                    <Button
                        type="button"
                        onClick={applyFilters}
                        className="h-10 rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                    >
                        Show Results
                    </Button>
                </div>
            </div>
        </section>
    )
}