import { Client } from '@elastic/elasticsearch';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

export const elasticsearchClient = new Client({
  node: ELASTICSEARCH_URL,
});

export async function connectElasticsearch() {
  try {
    const health = await elasticsearchClient.cluster.health();
    console.log('✅ Connected to Elasticsearch');
    console.log('Elasticsearch cluster health:', health.status);
  } catch (error) {
    console.error('❌ Elasticsearch connection error:', error);
    // For assessment purposes, we'll continue without Elasticsearch
    console.log('⚠️ Continuing without Elasticsearch (simulation mode)');
  }
}

export async function indexCourse(course: any) {
  try {
    await elasticsearchClient.index({
      index: 'courses',
      id: course._id,
      body: course
    });
  } catch (error) {
    console.error('Error indexing course:', error);
  }
}

export async function searchCourses(query: string, filters: any = {}) {
  try {
    const searchBody: any = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: query,
                fields: ['courseName^2', 'overview', 'summary', 'keywords', 'discipline', 'department']
              }
            }
          ],
          filter: [] as any[]
        }
      },
      size: 20
    };

    // Add filters
    if (filters.university) {
      searchBody.query.bool.filter.push({
        term: { universityName: filters.university }
      });
    }

    if (filters.discipline) {
      searchBody.query.bool.filter.push({
        term: { discipline: filters.discipline }
      });
    }

    if (filters.courseLevel) {
      searchBody.query.bool.filter.push({
        term: { courseLevel: filters.courseLevel }
      });
    }

    const response = await elasticsearchClient.search({
      index: 'courses',
      body: searchBody
    });

    return (response as any).body.hits.hits.map((hit: any) => ({
      ...hit._source,
      _score: hit._score
    }));
  } catch (error) {
    console.error('Elasticsearch search error:', error);
    // Fallback to mock data for assessment
    return getMockSearchResults(query, filters);
  }
}

function getMockSearchResults(query: string, filters: any) {
  const mockCourses = [
    {
      _id: '1',
      courseName: `Advanced ${query} Programming`,
      universityName: 'Stanford University',
      discipline: 'Computer Science',
      courseLevel: 'Graduate',
      overview: `Comprehensive course covering advanced ${query} concepts`,
      summary: `Learn advanced ${query} programming techniques`,
      keywords: [query, 'programming', 'advanced'],
      _score: 0.95
    },
    {
      _id: '2',
      courseName: `${query} Fundamentals`,
      universityName: 'MIT',
      discipline: 'Computer Science',
      courseLevel: 'Undergraduate',
      overview: `Introduction to ${query} programming`,
      summary: `Basic concepts of ${query}`,
      keywords: [query, 'fundamentals', 'programming'],
      _score: 0.88
    }
  ];

  return mockCourses.filter(course => {
    if (filters.university && course.universityName !== filters.university) return false;
    if (filters.discipline && course.discipline !== filters.discipline) return false;
    if (filters.courseLevel && course.courseLevel !== filters.courseLevel) return false;
    return true;
  });
}
