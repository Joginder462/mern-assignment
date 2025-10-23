import { Router, Request, Response } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { z } from 'zod';
import Course from '../models/Course';
import { indexCourse, searchCourses } from '../utils/elasticsearch';
import { getFromCache, setCache, invalidateCache } from '../utils/redis';
import { Readable } from 'stream';

const router = Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// CSV Upload endpoint
router.post('/courses/upload', upload.single('csvFile'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file provided'
      });
    }

    const results: any[] = [];
    const stream = Readable.from(req.file.buffer.toString());

    // Parse CSV
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    // Process and save courses
    const courses = [];
    for (const row of results) {
      try {
        const courseData = {
          uniqueId: row['Unique ID'] || row['uniqueId'],
          courseName: row['Course Name'] || row['courseName'],
          courseCode: row['Course Code'] || row['courseCode'],
          universityCode: row['University Code'] || row['universityCode'],
          universityName: row['University Name'] || row['universityName'],
          department: row['Department/School'] || row['department'],
          discipline: row['Discipline/Major'] || row['discipline'],
          specialization: row['Specialization'] || row['specialization'],
          courseLevel: row['Course Level'] || row['courseLevel'],
          overview: row['Overview/Description'] || row['overview'],
          summary: row['Summary'] || row['summary'],
          prerequisites: (row['Prerequisites (comma-separated)'] || '').split(',').map((p: string) => p.trim()).filter(Boolean),
          learningOutcomes: (row['Learning Outcomes (comma-separated)'] || '').split(',').map((l: string) => l.trim()).filter(Boolean),
          teachingMethodology: row['Teaching Methodology'] || row['teachingMethodology'],
          assessmentMethods: (row['Assessment Methods (comma-separated)'] || '').split(',').map((a: string) => a.trim()).filter(Boolean),
          credits: parseInt(row['Credits'] || '0') || 0,
          duration: parseInt(row['Duration (Months)'] || '0') || 0,
          languageOfInstruction: row['Language of Instruction'] || row['languageOfInstruction'],
          syllabusUrl: row['Syllabus URL'] || row['syllabusUrl'],
          keywords: (row['Keywords (comma-separated)'] || '').split(',').map((k: string) => k.trim()).filter(Boolean),
          professorName: row['Professor Name'] || row['professorName'],
          professorEmail: row['Professor Email'] || row['professorEmail'],
          officeLocation: row['Office Location'] || row['officeLocation'],
          openForIntake: row['Open for Intake (Year/Semester)'] || row['openForIntake'],
          admissionOpenYears: (row['Admission Open Years'] || '').split(',').map((y: string) => y.trim()).filter(Boolean),
          attendanceType: row['Attendance Type'] || row['attendanceType'],
          firstYearTuitionFee: parseFloat(row['1st Year Tuition Fee'] || '0') || 0,
          totalTuitionFee: parseFloat(row['Total Tuition Fee'] || '0') || 0,
          tuitionFeeCurrency: row['Tuition Fee Currency'] || row['tuitionFeeCurrency'],
          applicationFeeAmount: parseFloat(row['Application Fee Amount'] || '0') || 0,
          applicationFeeCurrency: row['Application Fee Currency'] || row['applicationFeeCurrency'],
          applicationFeeWaived: (row['Application Fee Waived (Yes/No)'] || '').toLowerCase() === 'yes',
          requiredApplicationMaterials: (row['Required Application Materials'] || '').split(',').map((m: string) => m.trim()).filter(Boolean),
          twelfthGradeRequirement: row['12th Grade Requirement'] || row['twelfthGradeRequirement'],
          undergraduateDegreeRequirement: row['Undergraduate Degree Requirement'] || row['undergraduateDegreeRequirement'],
          minimumIELTSScore: row['Minimum IELTS Score'] ? parseFloat(row['Minimum IELTS Score']) : undefined,
          minimumTOEFLScore: row['Minimum TOEFL Score'] ? parseFloat(row['Minimum TOEFL Score']) : undefined,
          minimumPTEScore: row['Minimum PTE Score'] ? parseFloat(row['Minimum PTE Score']) : undefined,
          minimumDuolingoScore: row['Minimum Duolingo Score'] ? parseFloat(row['Minimum Duolingo Score']) : undefined,
          minimumCambridgeEnglishScore: row['Minimum Cambridge English Score'] ? parseFloat(row['Minimum Cambridge English Score']) : undefined,
          otherEnglishTestsAccepted: (row['Other English Tests Accepted'] || '').split(',').map((t: string) => t.trim()).filter(Boolean),
          greRequired: (row['GRE Required (Yes/No)'] || '').toLowerCase() === 'yes',
          greScore: row['GRE Score'] ? parseFloat(row['GRE Score']) : undefined,
          gmatRequired: (row['GMAT Required (Yes/No)'] || '').toLowerCase() === 'yes',
          gmatScore: row['GMAT Score'] ? parseFloat(row['GMAT Score']) : undefined,
          satRequired: (row['SAT Required (Yes/No)'] || '').toLowerCase() === 'yes',
          satScore: row['SAT Score'] ? parseFloat(row['SAT Score']) : undefined,
          actRequired: (row['ACT Required (Yes/No)'] || '').toLowerCase() === 'yes',
          actScore: row['ACT Score'] ? parseFloat(row['ACT Score']) : undefined,
          waiverOptions: (row['Waiver Options'] || '').split(',').map((w: string) => w.trim()).filter(Boolean),
          partnerCourse: (row['Partner Course (Yes/No)'] || '').toLowerCase() === 'yes',
          ftRanking2024: row['FT Ranking 2024'] ? parseInt(row['FT Ranking 2024']) : undefined,
          acceptanceRate: row['Acceptance Rate'] ? parseFloat(row['Acceptance Rate']) : undefined,
          domesticApplicationDeadline: row['Domestic Application Deadline'] ? new Date(row['Domestic Application Deadline']) : undefined,
          internationalApplicationDeadline: row['International Application Deadline'] ? new Date(row['International Application Deadline']) : undefined,
          courseUrl: row['Course URL'] || row['courseUrl']
        };

        const course = new Course(courseData);
        await course.save();
        courses.push(course);

        // Index in Elasticsearch
        await indexCourse(course.toObject());
      } catch (error) {
        console.error('Error processing course row:', error);
      }
    }

    // Invalidate cache
    await invalidateCache('courses:*');

    res.json({
      success: true,
      message: `Successfully uploaded ${courses.length} courses`,
      data: {
        totalProcessed: results.length,
        totalSaved: courses.length,
        courses: courses.map(c => ({
          id: c._id,
          courseName: c.courseName,
          universityName: c.universityName
        }))
      }
    });

  } catch (error: any) {
    console.error('CSV upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload CSV file',
      error: error.message
    });
  }
});

// Search endpoint with caching
router.get('/courses/search', async (req: Request, res: Response) => {
  try {
    const { q: query, university, discipline, courseLevel, page = 1, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const cacheKey = `courses:search:${JSON.stringify({ query, university, discipline, courseLevel, page, limit })}`;
    
    // Check cache first
    const cachedResults = await getFromCache(cacheKey);
    if (cachedResults) {
      return res.json({
        success: true,
        data: cachedResults,
        message: 'Search results from cache',
        cached: true
      });
    }

    // Search in Elasticsearch
    const searchResults = await searchCourses(query as string, {
      university: university as string,
      discipline: discipline as string,
      courseLevel: courseLevel as string
    });

    const results = {
      query,
      filters: { university, discipline, courseLevel },
      results: searchResults,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: searchResults.length
      }
    };

    // Cache results for 1 hour
    await setCache(cacheKey, results, 3600);

    res.json({
      success: true,
      data: results,
      message: 'Search completed successfully',
      cached: false
    });

  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

// Get all courses with caching
router.get('/courses', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, university, discipline } = req.query;
    const cacheKey = `courses:list:${JSON.stringify({ page, limit, university, discipline })}`;
    
    // Check cache first
    const cachedResults = await getFromCache(cacheKey);
    if (cachedResults) {
      return res.json({
        success: true,
        data: cachedResults,
        message: 'Courses retrieved from cache',
        cached: true
      });
    }

    // Build query
    const query: any = {};
    if (university) query.universityName = university;
    if (discipline) query.discipline = discipline;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const courses = await Course.find(query)
      .skip(skip)
      .limit(parseInt(limit as string))
      .select('-__v')
      .lean();

    const total = await Course.countDocuments(query);

    const results = {
      courses,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    };

    // Cache results for 30 minutes
    await setCache(cacheKey, results, 1800);

    res.json({
      success: true,
      data: results,
      message: 'Courses retrieved successfully',
      cached: false
    });

  } catch (error: any) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses',
      error: error.message
    });
  }
});

// Get course by ID with caching
router.get('/courses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `courses:${id}`;
    
    // Check cache first
    const cachedCourse = await getFromCache(cacheKey);
    if (cachedCourse) {
      return res.json({
        success: true,
        data: cachedCourse,
        message: 'Course retrieved from cache',
        cached: true
      });
    }

    const course = await Course.findById(id).select('-__v').lean();
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Cache for 1 hour
    await setCache(cacheKey, course, 3600);

    res.json({
      success: true,
      data: course,
      message: 'Course retrieved successfully',
      cached: false
    });

  } catch (error: any) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course',
      error: error.message
    });
  }
});

export default router;
