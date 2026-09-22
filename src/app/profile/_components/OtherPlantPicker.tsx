'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/display/Badge'
import { PlantSelectDrawer } from '@/app/record/_components/PlantSelectDrawer'
import { usePlants } from '@/api/facades/plant'
import { cn } from '@/lib/utils/cn'

interface Props {
  selectedIds: number[]
  onChange: (ids: number[]) => void
}

export function OtherPlantPicker({ selectedIds, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const { data: plants } = usePlants()
  const selectedPlants = (plants ?? []).filter((plant) => selectedIds.includes(plant.id))

  const toggle = (id: number) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id])
  }

  return (
    <>
      <Badge
        label="기타"
        variant="ghost"
        color="gray"
        className={cn(
          'cursor-pointer rounded-xl px-3.5 py-2',
          selectedIds.length > 0 && 'border-brand-secondary text-text-secondary bg-green-50'
        )}
        onClick={() => setOpen(true)}
      />
      {selectedPlants.map((plant) => (
        <Badge
          key={plant.id}
          label={plant.name}
          variant="ghost"
          color="gray"
          className="border-brand-secondary text-text-secondary cursor-pointer rounded-xl bg-green-50 px-3.5 py-2"
          onClick={() => toggle(plant.id)}
        />
      ))}
      <PlantSelectDrawer
        open={open}
        onOpenChange={setOpen}
        plants={plants ?? []}
        selectedIds={selectedIds}
        onToggle={toggle}
      />
    </>
  )
}
