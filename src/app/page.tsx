// Home Page

import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@/components/ui';
import { getAllSports } from '@/lib/sports';

export default function HomePage() {
  const sports = getAllSports();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-xl">Scorr Studio</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">v2.0 Now Available</Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Professional Scoreboards for
            <span className="text-primary"> Every Sport</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Real-time scoreboard and live streaming platform for sports broadcasters, 
            tournament organizers, and content creators. Supports 20+ sports out of the box.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/app">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg">View Documentation</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">20+ Sports</CardTitle>
              <CardDescription>
                From table tennis to American football, we support every major sport with sport-specific scoring rules.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Real-Time Updates</CardTitle>
              <CardDescription>
                Sub-100ms latency ensures your broadcast overlay stays perfectly in sync with the action.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Custom Overlays</CardTitle>
              <CardDescription>
                Design beautiful, professional scoreboards with our visual editor. No coding required.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tournament Management</CardTitle>
              <CardDescription>
                Single elimination, double elimination, round robin, Swiss — handle any tournament format with ease.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">League Management</CardTitle>
              <CardDescription>
                Manage seasons, divisions, fixtures, and standings for ongoing league competitions.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social Integration</CardTitle>
              <CardDescription>
                Auto-post match results to Twitter, Instagram, and more with auto-generated scorecards.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Supported Sports */}
      <section className="container mx-auto px-4 py-16 bg-muted/50 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-4">Supported Sports</h2>
        <p className="text-center text-muted-foreground mb-8">
          Professional scoring for every sport you can imagine
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {sports.map((sport) => (
            <Card key={sport.id} className="text-center py-4">
              <CardContent className="p-2">
                <p className="font-medium text-sm">{sport.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <div className="text-3xl font-bold">$0<span className="text-lg font-normal">/mo</span></div>
              <CardDescription>Perfect for trying out</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Unlimited matches
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span> 1 league
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Standard displays
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">✗</span>
                <span className="text-muted-foreground">Custom overlays</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardHeader>
              <Badge className="w-fit mb-2">Popular</Badge>
              <CardTitle>Pro</CardTitle>
              <div className="text-3xl font-bold">$29<span className="text-lg font-normal">/mo</span></div>
              <CardDescription>For serious broadcasters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Everything in Free
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Multiple leagues
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Custom overlays
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Social automation
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <div className="text-3xl font-bold">$99<span className="text-lg font-normal">/mo</span></div>
              <CardDescription>For large organizations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Everything in Pro
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Unlimited leagues
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span> API access
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Priority support
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">S</span>
              </div>
              <span className="font-semibold">Scorr Studio</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Scorr Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
