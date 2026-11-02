export type CourseSummary = {
  id: number;
  slug: string;
  order: number;
  title: string;
  description: string;
  lessonsCount: number;
};

export type CourseLessonSummary = {
  id: number;
  slug: string;
  order: number;
  title: string;
};

export type CourseDetail = Omit<CourseSummary, "lessonsCount"> & {
  lessons: CourseLessonSummary[];
};
