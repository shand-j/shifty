"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, User, Code, Bug, Palette, Users, Megaphone } from "lucide-react"
import { useAppStore } from "@/lib/store"
import type { Persona } from "@/lib/types"

const personas: { value: Persona; label: string; icon: React.ElementType }[] = [
  { value: "po", label: "Product Owner", icon: User },
  { value: "dev", label: "Developer", icon: Code },
  { value: "qa", label: "QA Engineer", icon: Bug },
  { value: "designer", label: "Designer", icon: Palette },
  { value: "manager", label: "Manager", icon: Users },
  { value: "gtm", label: "GTM", icon: Megaphone },
]

export function PersonaSwitcher() {
  const { user, setUser } = useAppStore()
  const currentPersona = personas.find((p) => p.value === user?.persona) || personas[2]
  const Icon = currentPersona.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Icon className="w-4 h-4" />
          <span>{currentPersona.label} View</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Switch Dashboard View</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {personas.map((persona) => {
          const PersonaIcon = persona.icon
          return (
            <DropdownMenuItem
              key={persona.value}
              onClick={() => setUser(user ? { ...user, persona: persona.value } : null)}
            >
              <PersonaIcon className="w-4 h-4 mr-2" />
              {persona.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
