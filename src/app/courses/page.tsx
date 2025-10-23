'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, BookOpen, MapPin, Clock, DollarSign } from 'lucide-react';
import { useCourseStore } from '@/lib/stores';

export default function CourseSearchPage() {
  const { toast } = useToast();
  const { 
    searchResults, 
    isLoading, 
    searchQuery, 
    filters, 
    pagination,
    searchCourses, 
    setSearchQuery, 
    setFilters 
  } = useCourseStore();

  const [localQuery, setLocalQuery] = useState('');
  const [localFilters, setLocalFilters] = useState({
    university: '',
    discipline: '',
    courseLevel: ''
  });

  const handleSearch = async () => {
    // if (!localQuery.trim()) {
    //   toast({
    //     variant: 'destructive',
    //     title: 'Search Required',
    //     description: 'Please enter a search query.',
    //   });
    //   return;
    // }

    try {
      // Convert "all" values to empty strings for API
      const apiFilters = {
        university: localFilters.university === '' ? '' : localFilters.university,
        discipline: localFilters.discipline === '' ? '' : localFilters.discipline,
        courseLevel: localFilters.courseLevel === '' ? '' : localFilters.courseLevel
      };
      
      await searchCourses(localQuery, apiFilters);
      setSearchQuery(localQuery);
      setFilters(apiFilters);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: error.message || 'Failed to search courses.',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-primary">Course Search</h1>
        <p className="text-muted-foreground">Find the perfect course for your academic journey</p>
      </div>

      {/* Search Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Courses
          </CardTitle>
          <CardDescription>
            Search through our comprehensive course database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search courses, topics, or keywords..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">University</label>
              <Select value={localFilters.university} onValueChange={(value) => setLocalFilters(prev => ({ ...prev, university: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Universities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Universities</SelectItem>
                  <SelectItem value="Stanford University">Stanford University</SelectItem>
                  <SelectItem value="MIT">MIT</SelectItem>
                  <SelectItem value="Harvard University">Harvard University</SelectItem>
                  <SelectItem value="Carnegie Mellon University">Carnegie Mellon University</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Discipline</label>
              <Select value={localFilters.discipline} onValueChange={(value) => setLocalFilters(prev => ({ ...prev, discipline: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Disciplines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Disciplines</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Course Level</label>
              <Select value={localFilters.courseLevel} onValueChange={(value) => setLocalFilters(prev => ({ ...prev, courseLevel: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Graduate">Graduate</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Search Results for "{searchQuery}"
            {pagination.total > 0 && (
              <span className="text-muted-foreground ml-2">
                ({pagination.total} courses found)
              </span>
            )}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((course: any) => (
                <Card key={course._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{course.courseName}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {course.universityName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{course.discipline}</Badge>
                      <Badge variant="outline">{course.courseLevel}</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {course.summary || course.overview}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {course.duration} months
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        {course.totalTuitionFee?.toLocaleString()} {course.tuitionFeeCurrency}
                      </div>
                    </div>

                    {course.keywords && course.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {course.keywords.slice(0, 3).map((keyword: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button variant="outline" size="sm" className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters to find more courses.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
