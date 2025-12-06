"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  LayoutDashboard,
  TestTube2,
  Sparkles,
  PlayCircle,
  GitBranch,
  BarChart3,
  Settings,
  Plus,
  Search,
  FileText,
} from "lucide-react"
import { useAppStore } from "@/lib/store"

export function CommandPalette() {
  const router = useRouter()
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  const runCommand = React.useCallback(
    (command: () => void) => {
      setCommandPaletteOpen(false)
      command()
    },
    [setCommandPaletteOpen],
  )

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => router.push("/tests/generate"))}>
            <Plus className="mr-2 h-4 w-4" />
            Generate Test
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/sessions/new"))}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Start Session
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/insights/roi"))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            View ROI
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/healing"))}>
            <Sparkles className="mr-2 h-4 w-4" />
            Review Healing Queue
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/tests"))}>
            <TestTube2 className="mr-2 h-4 w-4" />
            Tests
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/healing"))}>
            <Sparkles className="mr-2 h-4 w-4" />
            Healing
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/sessions"))}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Sessions
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/pipelines"))}>
            <GitBranch className="mr-2 h-4 w-4" />
            Pipelines
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/insights"))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Insights
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Recent">
          <CommandItem>
            <FileText className="mr-2 h-4 w-4" />
            login.spec.ts
          </CommandItem>
          <CommandItem>
            <FileText className="mr-2 h-4 w-4" />
            checkout-flow.spec.ts
          </CommandItem>
          <CommandItem>
            <Search className="mr-2 h-4 w-4" />
            API endpoint tests
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
