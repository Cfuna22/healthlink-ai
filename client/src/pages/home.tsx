import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Brain, 
  MapPin, 
  BarChart3, 
  MessageCircle, 
  Shield, 
  Smartphone,
  ArrowRight,
  Play,
  Heart
} from "lucide-react";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="gradient-bg py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
                Your Smart Health Assistant
              </h1>
              <p className="text-xl text-primary-foreground/90 max-w-2xl">
                Get AI-powered symptom analysis, find nearby clinics, and track your health journey with our comprehensive community health platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/symptoms">
                  <Button 
                    size="lg" 
                    className="bg-background text-foreground hover:bg-background/90 h-12 px-8 py-3 text-base"
                    data-testid="button-start-health-check"
                  >
                    Start Health Check
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 h-12 px-8 py-3 text-base"
                  data-testid="button-watch-demo"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="lg:text-center">
              <img 
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Healthcare professional using tablet technology" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Comprehensive Health Management
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your health in one intelligent platform.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/symptoms">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-symptom-checker">
                <CardContent className="pt-6">
                  <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">AI Symptom Checker</h3>
                  <p className="text-muted-foreground">
                    Advanced machine learning algorithms analyze your symptoms and provide intelligent health insights.
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/clinics">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-clinic-finder">
                <CardContent className="pt-6">
                  <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Find Clinics</h3>
                  <p className="text-muted-foreground">
                    Find nearby healthcare facilities with real-time availability and integrated maps.
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/logs">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-health-tracking">
                <CardContent className="pt-6">
                  <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <BarChart3 className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Health Tracking</h3>
                  <p className="text-muted-foreground">
                    Monitor symptoms, medications, and health metrics to identify patterns over time.
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/chat">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-ai-chat">
                <CardContent className="pt-6">
                  <div className="mx-auto h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">24/7 AI Chat</h3>
                  <p className="text-muted-foreground">
                    Get instant answers to health questions from our intelligent AI assistant.
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Card className="text-center" data-testid="card-privacy">
              <CardContent className="pt-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Privacy First</h3>
                <p className="text-muted-foreground">
                  Your health data is encrypted and secure, with full control over your privacy settings.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center" data-testid="card-mobile">
              <CardContent className="pt-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                  <Smartphone className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Mobile Optimized</h3>
                <p className="text-muted-foreground">
                  Access your health information anywhere with our responsive mobile-first design.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Heart className="mx-auto h-16 w-16 text-primary mb-6" />
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
              Start Your Health Journey Today
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Take control of your health with our AI-powered platform. Get started with a free symptom check or explore our features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/symptoms">
                <Button size="lg" data-testid="button-get-started">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="outline" size="lg" data-testid="button-try-ai-chat">
                  Try AI Chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
