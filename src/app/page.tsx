import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, BookOpen, Users, TrendingUp, Search, Sparkles, Shield } from 'lucide-react';

export default function HomePage() {

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl font-bold mb-4 text-primary">
          Welcome to Course Compass
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your intelligent guide to finding the perfect educational path. Discover courses, 
          get AI-powered recommendations, and connect with the right programs for your goals.
        </p>
                </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardHeader>
            <Sparkles className="h-12 w-12 mx-auto text-accent mb-2" />
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>
              Get personalized course suggestions powered by advanced AI algorithms
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Search className="h-12 w-12 mx-auto text-accent mb-2" />
            <CardTitle>Smart Search</CardTitle>
            <CardDescription>
              Find courses with advanced search powered by Elasticsearch
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <BookOpen className="h-12 w-12 mx-auto text-accent mb-2" />
            <CardTitle>Course Discovery</CardTitle>
            <CardDescription>
              Explore thousands of courses from top universities worldwide
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Shield className="h-12 w-12 mx-auto text-accent mb-2" />
            <CardTitle>Admin Portal</CardTitle>
            <CardDescription>
              Secure admin dashboard for course and university management
            </CardDescription>
          </CardHeader>
        </Card>
                </div>

      <div className="text-center">
        <div className="space-x-4">
          <Link href="/recommendations">
            <Button size="lg" className="font-headline">
              <Sparkles className="mr-2 h-4 w-4" />
              Get AI Recommendations
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" size="lg">
              <Search className="mr-2 h-4 w-4" />
              Search Courses
            </Button>
          </Link>
          <Link href="/admin/login">
            <Button variant="secondary" size="lg">
              <Shield className="mr-2 h-4 w-4" />
              Admin Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
