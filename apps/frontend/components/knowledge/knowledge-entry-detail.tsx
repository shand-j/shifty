"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Share,
  LinkIcon,
  Clock,
  User,
  Bot,
  Sparkles,
  Tag,
  Network,
  MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

interface KnowledgeEntryDetailProps {
  entryId: string
}

export function KnowledgeEntryDetail({ entryId }: KnowledgeEntryDetailProps) {
  const [comment, setComment] = useState("")

  // Mock data - would fetch based on entryId
  const entry = {
    id: entryId,
    type: "architecture" as const,
    title: "Authentication Service Architecture",
    content: `## Overview

The authentication service implements OAuth 2.0 with PKCE (Proof Key for Code Exchange) flow for secure authentication across all client applications.

## Key Components

### Token Management
- **Access Tokens**: JWT format, 15-minute expiry
- **Refresh Tokens**: Opaque tokens, 7-day expiry with rotation
- **Token Storage**: HttpOnly cookies for web, secure storage for mobile

### Security Measures
1. PKCE flow prevents authorization code interception
2. Refresh token rotation on every use
3. Token binding to device fingerprint
4. Rate limiting on auth endpoints (100 req/min)

### Integration Points
- \`/api/auth/login\` - Initiates OAuth flow
- \`/api/auth/callback\` - Handles OAuth callback
- \`/api/auth/refresh\` - Refreshes access token
- \`/api/auth/logout\` - Invalidates all tokens

## Dependencies
- Redis for session storage
- PostgreSQL for user data
- AWS KMS for token signing keys

## Test Considerations
- Mock OAuth provider in tests
- Test token expiry scenarios
- Verify CORS configuration
- Check rate limiting behavior`,
    summary: "OAuth 2.0 + PKCE authentication flow with JWT tokens and refresh token rotation.",
    source: "agent" as const,
    sourceAgent: "Test Generator",
    tags: ["auth", "security", "api", "oauth", "jwt"],
    relatedEntities: ["AuthService", "UserController", "TokenManager", "SessionStore"],
    confidence: 0.95,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:22:00Z",
    createdBy: "Test Generator Agent",
    comments: [
      {
        id: "1",
        author: "Sarah Chen",
        content: "Good documentation. Should also mention the SAML integration for enterprise SSO.",
        timestamp: "2024-01-18T09:00:00Z",
      },
    ],
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/knowledge">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{entry.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <Badge variant="outline" className="capitalize">
                {entry.type}
              </Badge>
              <span className="flex items-center gap-1">
                <Bot className="w-3 h-3" />
                {entry.sourceAgent || entry.source}
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {Math.round(entry.confidence * 100)}% confidence
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-destructive bg-transparent">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {entry.content.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) {
                    return (
                      <h2 key={i} className="text-lg font-semibold mt-6 mb-3 text-foreground">
                        {line.replace("## ", "")}
                      </h2>
                    )
                  }
                  if (line.startsWith("### ")) {
                    return (
                      <h3 key={i} className="text-base font-medium mt-4 mb-2 text-foreground">
                        {line.replace("### ", "")}
                      </h3>
                    )
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <li key={i} className="text-muted-foreground ml-4">
                        {line.replace("- ", "")}
                      </li>
                    )
                  }
                  if (line.match(/^\d\./)) {
                    return (
                      <li key={i} className="text-muted-foreground ml-4 list-decimal">
                        {line.replace(/^\d\.\s/, "")}
                      </li>
                    )
                  }
                  if (line.startsWith("```")) {
                    return null
                  }
                  return (
                    <p key={i} className="text-muted-foreground">
                      {line}
                    </p>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Discussion ({entry.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entry.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{c.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.content}</p>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <Button size="sm" disabled={!comment.trim()}>
                Post Comment
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Created
                </span>
                <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Updated
                </span>
                <span>{new Date(entry.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Created by
                </span>
                <span>{entry.createdBy}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related Entities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Network className="w-4 h-4" />
                Related Entities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {entry.relatedEntities.map((entity) => (
                  <div
                    key={entity}
                    className="flex items-center gap-2 text-sm p-2 rounded bg-muted hover:bg-muted/80 cursor-pointer"
                  >
                    <LinkIcon className="w-3 h-3 text-muted-foreground" />
                    {entity}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
