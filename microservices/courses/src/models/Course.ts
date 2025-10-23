import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  _id: string;
  uniqueId: string;
  courseName: string;
  courseCode: string;
  universityCode: string;
  universityName: string;
  department: string;
  discipline: string;
  specialization?: string;
  courseLevel: string;
  overview: string;
  summary: string;
  prerequisites: string[];
  learningOutcomes: string[];
  teachingMethodology: string;
  assessmentMethods: string[];
  credits: number;
  duration: number;
  languageOfInstruction: string;
  syllabusUrl?: string;
  keywords: string[];
  professorName: string;
  professorEmail: string;
  officeLocation: string;
  openForIntake: string;
  admissionOpenYears: string[];
  attendanceType: string;
  firstYearTuitionFee: number;
  totalTuitionFee: number;
  tuitionFeeCurrency: string;
  applicationFeeAmount: number;
  applicationFeeCurrency: string;
  applicationFeeWaived: boolean;
  requiredApplicationMaterials: string[];
  twelfthGradeRequirement: string;
  undergraduateDegreeRequirement: string;
  minimumIELTSScore?: number;
  minimumTOEFLScore?: number;
  minimumPTEScore?: number;
  minimumDuolingoScore?: number;
  minimumCambridgeEnglishScore?: number;
  otherEnglishTestsAccepted: string[];
  greRequired: boolean;
  greScore?: number;
  gmatRequired: boolean;
  gmatScore?: number;
  satRequired: boolean;
  satScore?: number;
  actRequired: boolean;
  actScore?: number;
  waiverOptions: string[];
  partnerCourse: boolean;
  ftRanking2024?: number;
  acceptanceRate?: number;
  domesticApplicationDeadline?: Date;
  internationalApplicationDeadline?: Date;
  courseUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  uniqueId: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true },
  universityCode: { type: String, required: true },
  universityName: { type: String, required: true },
  department: { type: String, required: true },
  discipline: { type: String, required: true },
  specialization: { type: String },
  courseLevel: { type: String, required: true },
  overview: { type: String, required: true },
  summary: { type: String, required: true },
  prerequisites: [{ type: String }],
  learningOutcomes: [{ type: String }],
  teachingMethodology: { type: String, required: true },
  assessmentMethods: [{ type: String }],
  credits: { type: Number, required: true },
  duration: { type: Number, required: true },
  languageOfInstruction: { type: String, required: true },
  syllabusUrl: { type: String },
  keywords: [{ type: String }],
  professorName: { type: String, required: true },
  professorEmail: { type: String, required: true },
  officeLocation: { type: String, required: true },
  openForIntake: { type: String, required: true },
  admissionOpenYears: [{ type: String }],
  attendanceType: { type: String, required: true },
  firstYearTuitionFee: { type: Number, required: true },
  totalTuitionFee: { type: Number, required: true },
  tuitionFeeCurrency: { type: String, required: true },
  applicationFeeAmount: { type: Number, required: true },
  applicationFeeCurrency: { type: String, required: true },
  applicationFeeWaived: { type: Boolean, required: true },
  requiredApplicationMaterials: [{ type: String }],
  twelfthGradeRequirement: { type: String, required: true },
  undergraduateDegreeRequirement: { type: String, required: true },
  minimumIELTSScore: { type: Number },
  minimumTOEFLScore: { type: Number },
  minimumPTEScore: { type: Number },
  minimumDuolingoScore: { type: Number },
  minimumCambridgeEnglishScore: { type: Number },
  otherEnglishTestsAccepted: [{ type: String }],
  greRequired: { type: Boolean, required: true },
  greScore: { type: Number },
  gmatRequired: { type: Boolean, required: true },
  gmatScore: { type: Number },
  satRequired: { type: Boolean, required: true },
  satScore: { type: Number },
  actRequired: { type: Boolean, required: true },
  actScore: { type: Number },
  waiverOptions: [{ type: String }],
  partnerCourse: { type: Boolean, required: true },
  ftRanking2024: { type: Number },
  acceptanceRate: { type: Number },
  domesticApplicationDeadline: { type: Date },
  internationalApplicationDeadline: { type: Date },
  courseUrl: { type: String }
}, { timestamps: true });

export default mongoose.model<ICourse>('Course', CourseSchema);
