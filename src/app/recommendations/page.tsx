'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, BookOpen, MapPin, Star, Clock, Target } from 'lucide-react';
import { useAIStore } from '@/lib/stores';

export default function CourseRecommendationsPage() {
  const { toast } = useToast();
  const { 
    recommendations, 
    isLoading, 
    preferences,
    getRecommendations, 
    setPreferences 
  } = useAIStore();

  const [localPreferences, setLocalPreferences] = useState({
    topics: [''],
    skillLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: '',
    interests: [''],
    learningGoals: ''
  });

  const handleGetRecommendations = async () => {
    // Filter out empty strings
    const filteredTopics = localPreferences.topics.filter(topic => topic.trim() !== '');
    const filteredInterests = localPreferences.interests.filter(interest => interest.trim() !== '');

    if (filteredTopics.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Topics Required',
        description: 'Please enter at least one topic of interest.',
      });
      return;
    }

    try {
      await getRecommendations({
        topics: filteredTopics,
        skillLevel: localPreferences.skillLevel,
        duration: localPreferences.duration || undefined,
        interests: filteredInterests.length > 0 ? filteredInterests : undefined,
        learningGoals: localPreferences.learningGoals || undefined
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Recommendation Failed',
        description: error.message || 'Failed to get course recommendations.',
      });
    }
  };

  const addTopic = () => {
    setLocalPreferences(prev => ({
      ...prev,
      topics: [...prev.topics, '']
    }));
  };

  const removeTopic = (index: number) => {
    setLocalPreferences(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  const updateTopic = (index: number, value: string) => {
    setLocalPreferences(prev => ({
      ...prev,
      topics: prev.topics.map((topic, i) => i === index ? value : topic)
    }));
  };

  const addInterest = () => {
    setLocalPreferences(prev => ({
      ...prev,
      interests: [...prev.interests, '']
    }));
  };

  const removeInterest = (index: number) => {
    setLocalPreferences(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const updateInterest = (index: number, value: string) => {
    setLocalPreferences(prev => ({
      ...prev,
      interests: prev.interests.map((interest, i) => i === index ? value : interest)
    }));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-primary flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-accent" />
          AI Course Recommendations
        </h1>
        <p className="text-muted-foreground">Get personalized course recommendations powered by AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preferences Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Preferences
            </CardTitle>
            <CardDescription>
              Tell us about your interests and goals to get personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topics */}
            <div>
              <label className="text-sm font-medium mb-2 block">Topics of Interest *</label>
              <div className="space-y-2">
                {localPreferences.topics.map((topic, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="e.g., Machine Learning, Web Development"
                      value={topic}
                      onChange={(e) => updateTopic(index, e.target.value)}
                    />
                    {localPreferences.topics.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTopic(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addTopic}>
                  Add Topic
                </Button>
              </div>
            </div>

            {/* Skill Level */}
            <div>
              <label className="text-sm font-medium mb-2 block">Skill Level</label>
              <Select 
                value={localPreferences.skillLevel} 
                onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                  setLocalPreferences(prev => ({ ...prev, skillLevel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div>
              <label className="text-sm font-medium mb-2 block">Preferred Duration</label>
              <Input
                placeholder="e.g., 6 months, 1 year"
                value={localPreferences.duration}
                onChange={(e) => setLocalPreferences(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>

            {/* Interests */}
            <div>
              <label className="text-sm font-medium mb-2 block">Additional Interests</label>
              <div className="space-y-2">
                {localPreferences.interests.map((interest, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="e.g., Data Science, AI Ethics"
                      value={interest}
                      onChange={(e) => updateInterest(index, e.target.value)}
                    />
                    {localPreferences.interests.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeInterest(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addInterest}>
                  Add Interest
                </Button>
              </div>
            </div>

            {/* Learning Goals */}
            <div>
              <label className="text-sm font-medium mb-2 block">Learning Goals</label>
              <Textarea
                placeholder="Describe your learning objectives and career goals..."
                value={localPreferences.learningGoals}
                onChange={(e) => setLocalPreferences(prev => ({ ...prev, learningGoals: e.target.value }))}
                rows={3}
              />
            </div>

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
                      <Badge variant="secondary">{rec.category}</Badge>
                      <Badge variant="outline">{rec.difficulty}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {rec.duration}
                      </Badge>
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
                  Fill in your preferences and click "Get AI Recommendations" to receive personalized course suggestions.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
