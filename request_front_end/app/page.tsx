"use client"

import Link from "next/link"
import { ArrowRight, BarChart3, Lock, Users, Zap, QrCode, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"

export default function Home() {
  return (
    <LayoutWrapper hideNav>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Navigation */}
        <nav className="border-b border-border bg-card/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                GC
              </div>
              <span>Grade Contestation</span>
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-pretty">Streamlined Grade Contestation System</h1>
              <p className="text-lg text-muted-foreground mb-8">
                A transparent, efficient platform for students to contest grades, staff to review requests, and IT teams
                to process outcomes.
              </p>
              <div className="flex gap-4">
                <Link href="/signup">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-muted-foreground">Manage grade contestations with ease</p>
              </div>
            </div>
          </div>
        </section>

        {/* Role Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Three Powerful Roles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Students",
                icon: "👨‍🎓",
                description: "Submit and track your grade contestations in real-time",
                features: ["Create requests", "Track progress", "View results", "Print certificates"],
                color: "from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20",
              },
              {
                title: "Staff",
                icon: "👨‍🏫",
                description: "Review and make decisions on grade contestations",
                features: ["Review requests", "Make decisions", "Send to IT", "Complete processing"],
                color: "from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20",
              },
              {
                title: "IT Cell",
                icon: "💻",
                description: "Process final outcomes and update academic records",
                features: ["View requests", "Process data", "Return results", "Update records"],
                color: "from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20",
              },
            ].map((role, index) => (
              <Card key={index} className={`p-6 bg-gradient-to-br ${role.color} border-0`}>
                <div className="text-4xl mb-4">{role.icon}</div>
                <h3 className="text-xl font-bold mb-2">{role.title}</h3>
                <p className="text-muted-foreground mb-6 text-sm">{role.description}</p>
                <ul className="space-y-2">
                  {role.features.map((feature, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Zap,
                title: "Real-time Tracking",
                description: "Monitor your request status as it moves through each stage of the process",
              },
              {
                icon: QrCode,
                title: "QR Code Access",
                description: "Share unique QR codes for easy public access to request status",
              },
              {
                icon: Printer,
                title: "Print Support",
                description: "Print request details and results for official documentation",
              },
              {
                icon: Lock,
                title: "Role-Based Access",
                description: "Secure permissions ensure each user sees only what they need",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description: "Comprehensive statistics and insights for administrators",
              },
              {
                icon: Users,
                title: "Collaboration",
                description: "Seamless workflow between students, staff, and IT teams",
              },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="p-6">
                  <Icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Workflow */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: 1, title: "Submit", desc: "Student submits request" },
              { step: 2, title: "Review", desc: "Staff reviews and decides" },
              { step: 3, title: "Process", desc: "IT cell processes outcome" },
              { step: 4, title: "Return", desc: "Result sent back" },
              { step: 5, title: "Complete", desc: "Record updated" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {item.step}
                </div>
                <h4 className="font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Footer */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students and staff members who are using our system for seamless grade contestations
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Sign Up Now</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Already have an account? Login
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-card mt-20 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Grade Contestation System. All rights reserved.</p>
        </footer>
      </div>
    </LayoutWrapper>
  )
}
