import API_CLIENT from "./config";

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("faculty-pedia-auth-token");
  }
  return null;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth APIs
export const loginEducator = async (email, password) => {
  try {
    const response = await API_CLIENT.post("/api/auth/ed-login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    console.error("Error logging in educator:", error);
    throw error;
  }
};

// Get current educator by token
export const getCurrentEducator = async () => {
  try {
    const response = await API_CLIENT.get("/api/auth/educator/me", {
      headers: getAuthHeaders(),
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error fetching current educator:", error);
    throw error;
  }
};

// Educator Profile APIs
export const getEducatorProfile = async () => {
  try {
    const response = await API_CLIENT.get("/api/educator/profile", {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching educator profile:", error);
    throw error;
  }
};

export const updateEducatorProfile = async (data) => {
  try {
    const response = await API_CLIENT.put("/api/educator/profile", data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error updating educator profile:", error);
    throw error;
  }
};

// ============================================================
// Educator Update APIs (from educatorUpdate.routes.js)
// ============================================================

// Update educator's basic info (name, email, mobile, bio, introVideoLink)
export const updateEducatorBasicInfo = async (educatorId, data) => {
  try {
    const response = await API_CLIENT.put(
      `/api/educator-update/update-name-email-number-bio-ivlink/${educatorId}`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating educator basic info:", error);
    throw error;
  }
};

// Update educator profile image
export const updateEducatorImage = async (educatorId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await API_CLIENT.put(
      `/api/educator-update/update-image/${educatorId}`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating educator image:", error);
    throw error;
  }
};

// Update educator work experience
export const updateEducatorWorkExperience = async (
  educatorId,
  workExperience
) => {
  try {
    const response = await API_CLIENT.put(
      `/api/educator-update/update-work-experience/${educatorId}`,
      { workExperience },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating educator work experience:", error);
    throw error;
  }
};

// Update educator qualifications
export const updateEducatorQualifications = async (
  educatorId,
  qualification
) => {
  try {
    const response = await API_CLIENT.put(
      `/api/educator-update/update-qualifications/${educatorId}`,
      { qualification },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating educator qualifications:", error);
    throw error;
  }
};

// Update educator social links
export const updateEducatorSocialLinks = async (educatorId, socials) => {
  try {
    const response = await API_CLIENT.put(
      `/api/educator-update/update-social-links/${educatorId}`,
      { socials },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating educator social links:", error);
    throw error;
  }
};

// Update educator specialization and experience
export const updateEducatorSpecializationAndExperience = async (
  educatorId,
  data
) => {
  try {
    const response = await API_CLIENT.put(
      `/api/educator-update/update-specialization-experience/${educatorId}`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating educator specialization and experience:",
      error
    );
    throw error;
  }
};

// ============================================================
// Course APIs
// ============================================================
export const getCoursesByEducator = async (educatorId, params = {}) => {
  if (!educatorId) {
    throw new Error("Educator ID is required to fetch courses");
  }

  try {
    const response = await API_CLIENT.get(
      `/api/courses/educator/${educatorId}`,
      {
        headers: getAuthHeaders(),
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching educator courses:", error);
    throw error;
  }
};

export const getCourseById = async (courseId) => {
  try {
    const response = await API_CLIENT.get(`/api/course/by-id/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    throw error;
  }
};

export const getCoursesByIds = async (courseIds) => {
  try {
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return [];
    }

    const coursePromises = courseIds.map((id) => getCourseById(id));
    const results = await Promise.all(
      coursePromises.map((p) =>
        p.catch((err) => {
          console.warn("Failed to fetch course:", err);
          return null;
        })
      )
    );

    return results.filter((course) => course !== null);
  } catch (error) {
    console.error("Error fetching courses by IDs:", error);
    throw error;
  }
};

export const createCourse = async (courseData) => {
  try {
    const response = await API_CLIENT.post("/api/courses", courseData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    const isFormData =
      typeof FormData !== "undefined" && courseData instanceof FormData;

    const config = {
      headers: {
        ...getAuthHeaders(),
        ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
      },
    };

    const response = await API_CLIENT.put(
      `/api/course/update/${courseId}`,
      courseData,
      config
    );
    return response.data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

export const deleteCourse = async (courseId) => {
  try {
    const response = await API_CLIENT.delete(`/api/course/delete/${courseId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

// Question Bank APIs
export const getEducatorQuestions = async () => {
  try {
    const response = await API_CLIENT.get("/api/educator/questions", {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

export const createQuestion = async (questionData) => {
  try {
    const response = await API_CLIENT.post(
      "/api/questions/create-question",
      questionData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
};

export const updateQuestion = async (questionId, questionData) => {
  try {
    const response = await API_CLIENT.put(
      `/api/questions/${questionId}`,
      questionData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    const response = await API_CLIENT.delete(`/api/questions/${questionId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

export const getQuestionById = async (questionId) => {
  try {
    const response = await API_CLIENT.get(`/api/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching question by ID:", error);
    throw error;
  }
};

export const getQuestionsByIds = async (questionIds) => {
  try {
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return [];
    }

    const questionPromises = questionIds.map((id) => getQuestionById(id));
    const results = await Promise.all(
      questionPromises.map((p) =>
        p.catch((err) => {
          console.warn("Failed to fetch question:", err);
          return null;
        })
      )
    );

    return results.filter((question) => question !== null);
  } catch (error) {
    console.error("Error fetching questions by IDs:", error);
    throw error;
  }
};

// Test Series APIs
export const getEducatorTestSeries = async () => {
  try {
    const response = await API_CLIENT.get("/api/educator/test-series", {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching test series:", error);
    throw error;
  }
};

export const createTestSeries = async (testSeriesData) => {
  try {
    // Check if testSeriesData contains a file (image)
    const isFormData = testSeriesData instanceof FormData;

    const config = {
      headers: {
        ...getAuthHeaders(),
        ...(isFormData && { "Content-Type": "multipart/form-data" }),
      },
    };

    const response = await API_CLIENT.post(
      "/api/test-series/create-test-series",
      testSeriesData,
      config
    );
    return response.data;
  } catch (error) {
    console.error("Error creating test series:", error);
    throw error;
  }
};

export const updateTestSeries = async (testSeriesId, testSeriesData) => {
  try {
    const response = await API_CLIENT.put(
      `/api/test-series/${testSeriesId}`,
      testSeriesData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating test series:", error);
    throw error;
  }
};

export const deleteTestSeries = async (testSeriesId) => {
  try {
    const response = await API_CLIENT.delete(
      `/api/test-series/${testSeriesId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting test series:", error);
    throw error;
  }
};

export const getTestSeriesById = async (testSeriesId) => {
  try {
    const response = await API_CLIENT.get(`/api/test-series/${testSeriesId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching test series by ID:", error);
    throw error;
  }
};

export const getTestSeriesByIds = async (testSeriesIds) => {
  try {
    if (!Array.isArray(testSeriesIds) || testSeriesIds.length === 0) {
      return [];
    }

    const testSeriesPromises = testSeriesIds.map((id) => getTestSeriesById(id));
    const results = await Promise.all(
      testSeriesPromises.map((p) =>
        p.catch((err) => {
          console.warn("Failed to fetch test series:", err);
          return null;
        })
      )
    );

    return results.filter((testSeries) => testSeries !== null);
  } catch (error) {
    console.error("Error fetching test series by IDs:", error);
    throw error;
  }
};

// Pay Per Hour APIs
export const getEducatorPayPerHourSessions = async (educatorId) => {
  try {
    const response = await API_CLIENT.get(
      `/api/pay-per-hour/educator/${educatorId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Pay Per Hour sessions:", error);
    throw error;
  }
};

export const createPayPerHourSession = async (sessionData) => {
  try {
    const response = await API_CLIENT.post(
      "/api/pay-per-hour/create-pph",
      sessionData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating Pay Per Hour session:", error);
    throw error;
  }
};

export const updatePayPerHourSession = async (sessionId, sessionData) => {
  try {
    const response = await API_CLIENT.put(
      `/api/pay-per-hour/edit/${sessionId}`,
      sessionData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating Pay Per Hour session:", error);
    throw error;
  }
};

export const deletePayPerHourSession = async (sessionId) => {
  try {
    const response = await API_CLIENT.delete(
      `/api/pay-per-hour/delete/${sessionId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting Pay Per Hour session:", error);
    throw error;
  }
};

export const getEducatorWebinars = async (educatorId) => {
  try {
    const response = await API_CLIENT.get(
      `/api/webinars/educator/${educatorId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching educator webinars:", error);
    throw error;
  }
};

export const getEducatorLiveClasses = async () => {
  try {
    const response = await API_CLIENT.get("/api/educator/live-classes", {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Pay Per Hour:", error);
    throw error;
  }
};

export const createLiveClass = async (liveClassData) => {
  try {
    const response = await API_CLIENT.post(
      "/api/educator/live-classes",
      liveClassData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating live class:", error);
    throw error;
  }
};

export const updateLiveClass = async (liveClassId, liveClassData) => {
  try {
    const response = await API_CLIENT.put(
      `/api/educator/live-classes/${liveClassId}`,
      liveClassData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating live class:", error);
    throw error;
  }
};

export const deleteLiveClass = async (liveClassId) => {
  try {
    const response = await API_CLIENT.delete(
      `/api/educator/live-classes/${liveClassId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting live class:", error);
    throw error;
  }
};

export const getLiveClassById = async (liveClassId) => {
  try {
    const response = await API_CLIENT.get(`/api/live-class/${liveClassId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching live class by ID:", error);
    throw error;
  }
};

export const getLiveClassesByIds = async (liveClassIds) => {
  try {
    if (!Array.isArray(liveClassIds) || liveClassIds.length === 0) {
      return [];
    }

    const liveClassPromises = liveClassIds.map((id) => getLiveClassById(id));
    const results = await Promise.all(
      liveClassPromises.map((p) =>
        p.catch((err) => {
          console.warn("Failed to fetch live class:", err);
          return null;
        })
      )
    );

    return results.filter((liveClass) => liveClass !== null);
  } catch (error) {
    console.error("Error fetching Pay Per Hour by IDs:", error);
    throw error;
  }
};

// Image upload function
export const uploadImage = async (imageFile, type = "course") => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await API_CLIENT.post(
      `/api/upload/image?type=${type}`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const createWebinar = async (educatorId, webinarData) => {
  try {
    const response = await API_CLIENT.post(
      `/api/webinars/create-webinar/${educatorId}`,
      webinarData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating webinar:", error);
    throw error;
  }
};

export const updateWebinar = async (webinarId, webinarData) => {
  try {
    const response = await API_CLIENT.put(
      `/api/webinars/update/${webinarId}`,
      webinarData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating webinar:", error);
    throw error;
  }
};

export const deleteWebinar = async (webinarId) => {
  try {
    const response = await API_CLIENT.delete(
      `/api/webinars/delete/${webinarId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting webinar:", error);
    throw error;
  }
};

export const getWebinarById = async (webinarId) => {
  try {
    const response = await API_CLIENT.get(
      `/api/webinar/webinar-by-id/${webinarId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching webinar by ID:", error);
    throw error;
  }
};

export const getWebinarsByIds = async (webinarIds) => {
  try {
    if (!Array.isArray(webinarIds) || webinarIds.length === 0) {
      return [];
    }

    const webinarPromises = webinarIds.map((id) => getWebinarById(id));
    const results = await Promise.all(
      webinarPromises.map((p) =>
        p.catch((err) => {
          console.warn("Failed to fetch webinar:", err);
          return null;
        })
      )
    );

    return results.filter((webinar) => webinar !== null);
  } catch (error) {
    console.error("Error fetching webinars by IDs:", error);
    throw error;
  }
};

// Students APIs
export const getEducatorStudents = async () => {
  try {
    const response = await API_CLIENT.get("/api/educator/students", {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

export const getStudentById = async (studentId) => {
  try {
    const response = await API_CLIENT.get(
      `/api/students/profile/${studentId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student by ID:", error);
    throw error;
  }
};

export const getStudentsByIds = async (studentIds) => {
  try {
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return [];
    }

    const studentPromises = studentIds.map((id) => getStudentById(id));
    const results = await Promise.all(
      studentPromises.map((p) =>
        p.catch((err) => {
          console.warn("Failed to fetch student:", err);
          return null;
        })
      )
    );

    return results.filter((student) => student !== null);
  } catch (error) {
    console.error("Error fetching students by IDs:", error);
    throw error;
  }
};

// Dashboard Stats APIs
export const getDashboardStats = async () => {
  try {
    const response = await API_CLIENT.get("/api/educator/dashboard/stats", {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// Live Test APIs
export const getEducatorQuestionsByEducatorId = async (educatorId) => {
  try {
    const response = await API_CLIENT.get(
      `/api/questions/educator/${educatorId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching educator questions:", error);
    throw error;
  }
};

export const getEducatorTests = async (educatorId) => {
  try {
    const response = await API_CLIENT.get(
      `/api/live-test/educator/${educatorId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching educator tests:", error);
    throw error;
  }
};

export const createLiveTest = async (testData) => {
  try {
    const response = await API_CLIENT.post(
      "/api/live-test/create-test",
      testData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating live test:", error);
    throw error;
  }
};

export const updateLiveTest = async (testId, testData) => {
  try {
    const response = await API_CLIENT.put(
      `/api/live-test/${testId}`,
      testData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating live test:", error);
    throw error;
  }
};

export const deleteLiveTest = async (testId) => {
  try {
    const response = await API_CLIENT.delete(`/api/live-test/${testId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting live test:", error);
    throw error;
  }
};
