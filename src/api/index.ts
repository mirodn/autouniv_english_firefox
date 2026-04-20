import {
  AssignmentResponse,
  Course,
  CourseStatus,
  AssignmentDetailResponse,
  AssignmentInfo,
  AssignmentAssessmentResponse,
  AssignmentShortInfo,
  LectureType,
} from "@/types";
import { getAxios } from "./axios";

interface FetchStudentIdParams {
  courseId: number;
  userId: number;
}

interface FetchAssignmentsParams {
  courseId: number;
  userId: number;
  studentId: string;
}

interface FetchStudentIdResponse {
  item: CourseStatus;
  assignments: AssignmentResponse[];
}

interface FetchAndJoinAssignmentInfosParam {
  courseId: number;
  userId: number;
}

const fetchCourses = async () => {
  const axios = await getAxios();
  const { data } = await axios.get<Course[]>("api/v1/users/self/favorites/courses", {
    headers: { Authorization: undefined },
  });
  return data;
};

const fetchStudentId = async ({ courseId, userId }: FetchStudentIdParams) => {
  const axios = await getAxios();
  const { data } = await axios.get<FetchStudentIdResponse>(
    `learningx/api/v1/courses/${courseId}/total_learnstatus/users/${userId}`
  );
  return data.item.user_login;
};

const fetchCourseStatus = async ({ courseId, userId }: FetchStudentIdParams) => {
  const axios = await getAxios();
  const { data } = await axios.get<FetchStudentIdResponse>(
    `learningx/api/v1/courses/${courseId}/total_learnstatus/users/${userId}`
  );
  return data;
};

const fetchCourseAssignmentDetails = async ({
  courseId,
  userId,
  studentId,
}: FetchAssignmentsParams) => {
  const axios = await getAxios();
  const { data } = await axios.get<AssignmentDetailResponse[]>(
    `learningx/api/v1/courses/${courseId}/allcomponents_db?user_id=${userId}&user_login=${studentId}&role=1`
  );
  return data;
};

const fetchAssignmentAssessment = async (courseId: number): Promise<AssignmentShortInfo[]> => {
  const axios = await getAxios();
  const { data } = await axios.get<AssignmentAssessmentResponse[]>(
    `api/v1/courses/${courseId}/assignment_groups?exclude_response_fields[]=description&exclude_response_fields[]=rubric&include[]=assignments&include[]=discussion_topic&override_assignment_dates=true&per_page=50`,
    { headers: { Authorization: undefined } }
  );
  return Object.values(data)
    .map((assessment) =>
      assessment.assignments.map((val) => ({
        assignment_id: +val.id,
        course_id: courseId,
        due_at: val.due_at,
        unlock_at: val.unlock_at,
        title: val.name,
        view_info: {
          view_url: val.html_url,
        },
        id: +val.id,
      }))
    )
    .flat();
};

const fetchAndJoinAssignmentInfos = async ({
  courseId,
  userId,
}: FetchAndJoinAssignmentInfosParam) => {
  const { assignments: videoAssignments, item: courseStatus } = await fetchCourseStatus({
    courseId,
    userId: userId ?? 0,
  });
  const assignmentDetails = await fetchCourseAssignmentDetails({
    courseId,
    userId: userId ?? 0,
    studentId: courseStatus.user_login,
  });

  const regularAssignments = assignmentDetails.map((detail) => ({
    ...detail,
    course_id: courseId,
  })) as AssignmentInfo[];

  const attendanceMap = courseStatus as unknown as Record<string, string>;
  const videoLectures = videoAssignments
    .filter((video) => video.content_type === "movie")
    .map((video) => ({
      assignment_id: video.id,
      component_id: video.component_id,
      completed: attendanceMap[`attendance_${video.component_id}_status`] === "attendance",
      opened: true,
      title: video.name,
      description: "",
      type: "video",
      due_at: video.due_at,
      unlock_at: video.unlock_at,
      late_at: video.late_at,
      lock_at: video.lock_at,
      created_at: "",
      use_attendance: true,
      commons_content: {
        content_id: video.content_id,
        content_type: video.content_type as LectureType,
        view_url: video.view_url,
        thumbnail_url: "",
        progress_support: true,
        duration: video.duration,
      },
      view_info: { view_url: video.view_url },
      id: video.id,
      name: video.name,
      content_id: video.content_id,
      content_type: video.content_type,
      view_url: video.view_url,
      duration: video.duration,
      section_id: video.section_id,
      subsection_id: video.subsection_id,
      course_id: courseId,
    })) as AssignmentInfo[];

  return [...videoLectures, ...regularAssignments];
};

export {
  fetchCourses,
  fetchStudentId,
  fetchCourseStatus,
  fetchAssignmentAssessment,
  fetchCourseAssignmentDetails,
  fetchAndJoinAssignmentInfos,
};
