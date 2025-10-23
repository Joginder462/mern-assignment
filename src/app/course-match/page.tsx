'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, BookOpen, MapPin, Star, Clock, Target } from 'lucide-react';

export default function CourseMatchPage() {
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const handleGetRecommendations = async () => {
    if (!description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Description Required',
        description: 'Please enter a description of your interests and goals.',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const mockRecommendations = [
        {
          courseName: `Advanced ${description.split(' ')[0]} Programming`,
          universityName: 'Stanford University',
          matchScore: 92,
          rationale: `Perfect match for students interested in ${description}`,
          category: 'Computer Science',
          duration: '12 weeks',
          difficulty: 'advanced'
        },
        {
          courseName: `${description.split(' ')[0]} Fundamentals`,
          universityName: 'MIT',
          matchScore: 88,
          rationale: `Comprehensive introduction to ${description.split(' ')[0]} concepts`,
          category: 'Computer Science',
          duration: '8 weeks',
          difficulty: 'beginner'
        }
      ];
      
      setRecommendations(mockRecommendations);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-primary flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-accent" />
          AI Course Match
        </h1>
        <p className="text-muted-foreground">Get personalized course recommendations powered by AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Interests & Goals
            </CardTitle>
            <CardDescription>
              Describe your academic interests, career goals, and learning preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="I'm interested in machine learning, data science, and want to work in AI research. I have a background in mathematics and programming..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
            
            <Button 
              onClick={handleGetRecommendations} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Getting Recommendations...' : 'Get AI Recommendations'}
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <div>
          {isLoading ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">AI is analyzing your preferences...</p>
              </CardContent>
            </Card>
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Recommended Courses</h2>
              {recommendations.map((rec, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{rec.courseName}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {rec.universityName}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{rec.matchScore}%</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm">{rec.category}</span>
                      <span className="px-2 py-1 bg-outline text-foreground rounded text-sm">{rec.difficulty}</span>
                      <span className="px-2 py-1 bg-outline text-foreground rounded text-sm flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {rec.duration}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {rec.rationale}
                    </p>

                    <Button variant="outline" size="sm" className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Get Started</h3>
                <p className="text-muted-foreground">
                  Describe your interests and goals to receive personalized course recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}