"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ResponseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { score: string; reason: string }) => void
  decision: "approve" | "reject" | null
}

export function ResponseModal({ open, onOpenChange, onSubmit, decision }: ResponseModalProps) {
  const [score, setScore] = useState("")
  const [reason, setReason] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ score, reason })
    setScore("")
    setReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{decision === "approve" ? "Approve Request" : "Reject Request"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">New Score (0-20)</label>
            <input
              type="number"
              min="0"
              max="20"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Enter new score"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reason {decision === "reject" && "(Required)"}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain your decision..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Submit Response
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
