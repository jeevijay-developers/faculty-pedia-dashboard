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
    const response = await API_CLIENT.get(`/api/courses/${courseId}`, {
      headers: getAuthHeaders(),
    });
    return response.data?.course ?? response.data;
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

// ============================================================
// Video APIs
// ============================================================

const normalizeVideoLinksPayload = (links = []) =>
  (Array.isArray(links) ? links : [links])
    .map((link) => (typeof link === "string" ? link.trim() : ""))
    .filter((link) => link.length > 0);

export const getVideos = async (params = {}) => {
  try {
    const response = await API_CLIENT.get("/api/videos", {
      headers: getAuthHeaders(),
      params,
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
};

export const createVideo = async ({
  title,
  links,
  isCourseSpecific = false,
  courseId,
}) => {
  try {
    const normalizedLinks = normalizeVideoLinksPayload(links);

    if (!normalizedLinks.length) {
      throw new Error("At least one video link is required");
    }

    const payload = {
      title: title?.trim?.() || "",
      links: normalizedLinks,
      isCourseSpecific,
    };

    if (isCourseSpecific && courseId) {
      payload.courseId = courseId;
    }

    const response = await API_CLIENT.post("/api/videos", payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error creating video:", error);
    throw error;
  }
};

export const deleteVideo = async (videoId) => {
  if (!videoId) {
    throw new Error("Video ID is required to delete a video");
  }

  try {
    const response = await API_CLIENT.delete(`/api/videos/${videoId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting video:", error);
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
      `/api/courses/${courseId}`,
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
    const response = await API_CLIENT.delete(`/api/courses/${courseId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

// Question Bank APIs
export const getQuestions = async (params = {}) => {
  try {
    const response = await API_CLIENT.get("/api/questions", {
      headers: getAuthHeaders(),
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

export const getEducatorQuestions = async (educatorId, params = {}) => {
  if (!educatorId) {
    throw new Error("Educator ID is required to fetch questions");
  }

  try {
    const response = await API_CLIENT.get(
      `/api/questions/educator/${educatorId}`,
      {
        headers: getAuthHeaders(),
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching educator questions:", error);
    throw error;
  }
};

export const createQuestion = async (questionData) => {
  try {
    const response = await API_CLIENT.post("/api/questions", questionData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
};

export const updateQuestion = async (questionId, questionData) => {
  if (!questionId) {
    throw new Error("Question ID is required to update a question");
  }

  try {
    const response = await API_CLIENT.put(
      `/api/questions/${questionId}`,
      questionData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
};

// ============================================================
// Study Material APIs
// ============================================================

export const getStudyMaterialsByEducator = async (educatorId, params = {}) => {
  if (!educatorId) {
    throw new Error("Educator ID is required to fetch study materials");
  }

  try {
    const response = await API_CLIENT.get(
      `/api/study-materials/educator/${educatorId}`,
      {
        headers: getAuthHeaders(),
        params,
      }
    );
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error fetching study materials:", error);
    throw error;
  }
};

export const createStudyMaterialEntry = async ({
  educatorID,
  title,
  description,
  docs = [],
  tags = [],
  isCourseSpecific = false,
  courseId,
}) => {
  if (!educatorID) {
    throw new Error("Educator ID is required to create study material");
  }

  if (typeof FormData === "undefined") {
    throw new Error("FormData is not supported in this environment");
  }

  const formData = new FormData();
  formData.append("educatorID", educatorID);
  formData.append("title", title);

  if (description) {
    formData.append("description", description);
  }

  formData.append("isCourseSpecific", String(isCourseSpecific));

  if (isCourseSpecific && courseId) {
    formData.append("courseId", courseId);
  }

  tags
    .filter((tag) => typeof tag === "string" && tag.trim().length > 0)
    .forEach((tag) => formData.append("tags[]", tag.trim()));

  docs.forEach((file) => {
    if (file) {
      formData.append("docs", file);
    }
  });

  try {
    const response = await API_CLIENT.post("/api/study-materials", formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating study material:", error);
    throw error;
  }
};

export const deleteStudyMaterialEntry = async (studyMaterialId) => {
  if (!studyMaterialId) {
    throw new Error("Study material ID is required to delete study material");
  }

  try {
    const response = await API_CLIENT.delete(
      `/api/study-materials/${studyMaterialId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting study material:", error);
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
  if (!questionId) {
    throw new Error("Question ID is required to fetch a question");
  }

  try {
    const response = await API_CLIENT.get(`/api/questions/${questionId}`, {
      headers: getAuthHeaders(),
    });
    const payload = response.data;
    return payload?.data ?? payload;
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
export const getEducatorTestSeries = async (educatorId, params = {}) => {
  if (!educatorId) {
    throw new Error("Educator ID is required to fetch test series");
  }

  try {
    const response = await API_CLIENT.get(
      `/api/test-series/educator/${educatorId}`,
      {
        headers: getAuthHeaders(),
        params,
      }
    );

    const payload = response.data;
    if (payload?.testSeries) {
      return payload;
    }
    if (payload?.data?.testSeries) {
      return payload.data;
    }
    return { testSeries: payload || [], pagination: null };
  } catch (error) {
    console.error("Error fetching test series:", error);
    throw error;
  }
};

export const createTestSeries = async (testSeriesData) => {
  try {
    const isFormData =
      typeof FormData !== "undefined" && testSeriesData instanceof FormData;

    const config = {
      headers: {
        ...getAuthHeaders(),
        ...(isFormData && { "Content-Type": "multipart/form-data" }),
      },
    };

    const response = await API_CLIENT.post(
      "/api/test-series",
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
    const isFormData =
      typeof FormData !== "undefined" && testSeriesData instanceof FormData;

    const response = await API_CLIENT.put(
      `/api/test-series/${testSeriesId}`,
      testSeriesData,
      {
        headers: {
          ...getAuthHeaders(),
          ...(isFormData && { "Content-Type": "multipart/form-data" }),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating test series:", error);
    throw error;
  }
};

export const updateTestSeriesImage = async (testSeriesId, imageFile) => {
  if (!testSeriesId) {
    throw new Error("Test series ID is required to update the image");
  }
  if (!imageFile) {
    throw new Error("Image file is required to update the test series banner");
  }

  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await API_CLIENT.put(
      `/api/test-series/${testSeriesId}/image`,
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
    console.error("Error updating test series image:", error);
    throw error;
  }
};

export const assignTestSeriesToCourse = async (testSeriesId, courseId) => {
  if (!testSeriesId) {
    throw new Error("Test series ID is required to assign course");
  }

  try {
    const response = await API_CLIENT.put(
      `/api/test-series/${testSeriesId}/assign-course`,
      { courseId },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning test series to course:", error);
    throw error;
  }
};

// Bulk assign tests to a test series
export const bulkAssignTestsToSeries = async (testSeriesId, testIds) => {
  if (!testSeriesId) {
    throw new Error("Test series ID is required");
  }
  if (!Array.isArray(testIds) || testIds.length === 0) {
    throw new Error("Test IDs must be a non-empty array");
  }

  try {
    const response = await API_CLIENT.post(
      `/api/test-series/${testSeriesId}/tests/bulk`,
      { testIds },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error bulk assigning tests to test series:", error);
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
    const payload = response.data;
    return payload?.testSeries || payload?.data || payload;
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

export const getEducatorWebinars = async (educatorId, params = {}) => {
  try {
    const response = await API_CLIENT.get(
      `/api/webinars/educator/${educatorId}`,
      {
        headers: getAuthHeaders(),
        params,
      }
    );
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error fetching educator webinars:", error);
    throw error;
  }
};

export const getLiveClassesByEducator = async (educatorId, params = {}) => {
  if (!educatorId) {
    throw new Error("Educator ID is required to fetch live classes");
  }

  try {
    const response = await API_CLIENT.get(`/api/live-classes`, {
      headers: getAuthHeaders(),
      params: {
        educatorID: educatorId,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching educator live classes:", error);
    throw error;
  }
};

export const createLiveClass = async (liveClassData) => {
  try {
    const response = await API_CLIENT.post("/api/live-classes", liveClassData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error creating live class:", error);
    throw error;
  }
};

export const updateLiveClass = async (liveClassId, liveClassData) => {
  try {
    const response = await API_CLIENT.put(
      `/api/live-classes/${liveClassId}`,
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
      `/api/live-classes/${liveClassId}`,
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
    const response = await API_CLIENT.get(`/api/live-classes/${liveClassId}`, {
      headers: getAuthHeaders(),
    });
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

export const uploadPdf = async (pdfFile) => {
  try {
    const formData = new FormData();
    formData.append("file", pdfFile);

    const response = await API_CLIENT.post(`/api/upload/pdf`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
};

const combineDateAndTime = (dateValue, timeValue) => {
  if (!dateValue) {
    return undefined;
  }

  const normalizedDate = dateValue.includes("T")
    ? dateValue.split("T")[0]
    : dateValue;

  if (!timeValue && dateValue.includes("T")) {
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }

  const isoCandidate = `${normalizedDate}T${timeValue || "00:00"}`;
  const parsed = new Date(isoCandidate);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

const normalizeWebinarPayload = (
  webinarData = {},
  educatorId,
  { applyDefaults = false } = {}
) => {
  const {
    description,
    shortDescription,
    longDescription,
    webinarType,
    subject,
    specialization,
    seatLimit,
    duration,
    fees,
    class: classLevels,
    classes,
    classList,
    className,
    date,
    time,
    timing,
    assetsLink,
    assetLinks,
    assetsLinks,
    educatorID,
    educatorId: payloadEducatorId,
    ...rest
  } = webinarData;

  const descriptionPieces = [
    typeof description === "string" ? description : undefined,
    description?.short,
    description?.long,
    shortDescription,
    longDescription,
  ].filter((value) => typeof value === "string" && value.trim().length > 0);

  const normalizedDescription = descriptionPieces.join("\n\n").trim();

  const normalizedTiming =
    timing ||
    combineDateAndTime(date, time) ||
    (date ? combineDateAndTime(date) : undefined);

  const subjects = Array.isArray(subject)
    ? subject
    : typeof subject === "string"
    ? subject
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const specializations = Array.isArray(specialization)
    ? specialization
    : specialization
    ? [specialization]
    : [];

  const classOptions =
    classLevels ||
    classes ||
    classList ||
    (className ? [className] : undefined);
  const classArray = Array.isArray(classOptions)
    ? classOptions.filter(Boolean)
    : classOptions
    ? [classOptions]
    : [];

  const normalizedClass =
    classArray.length > 0
      ? classArray
      : applyDefaults
      ? ["class-12th"]
      : undefined;

  const normalizedAssets = (() => {
    if (Array.isArray(assetsLink)) {
      return assetsLink.filter(Boolean);
    }
    if (Array.isArray(assetsLinks)) {
      return assetsLinks.filter(Boolean);
    }
    if (Array.isArray(assetLinks)) {
      return assetLinks
        .map((asset) =>
          typeof asset === "string"
            ? asset
            : typeof asset?.link === "string"
            ? asset.link.trim()
            : null
        )
        .filter(Boolean);
    }
    if (typeof assetsLink === "string") {
      return [assetsLink];
    }
    return undefined;
  })();

  const normalizedWebinarType = (() => {
    if (typeof webinarType === "string" && webinarType.trim().length > 0) {
      const lowered = webinarType.trim().toLowerCase();
      return lowered === "oto" || lowered === "one-to-one"
        ? "one-to-one"
        : "one-to-all";
    }
    return applyDefaults ? "one-to-all" : undefined;
  })();

  const payload = {
    ...rest,
    ...(normalizedDescription && { description: normalizedDescription }),
    ...(normalizedTiming && { timing: normalizedTiming }),
    ...(subjects.length > 0 && { subject: subjects }),
    ...(specializations.length > 0 && { specialization: specializations }),
    ...(typeof seatLimit !== "undefined" && { seatLimit: Number(seatLimit) }),
    ...(typeof duration !== "undefined" && { duration: String(duration) }),
    ...(typeof fees !== "undefined" && { fees: Number(fees) }),
    ...(normalizedClass && { class: normalizedClass }),
    ...(normalizedAssets &&
      normalizedAssets.length > 0 && {
        assetsLink: normalizedAssets,
      }),
    ...(normalizedWebinarType && { webinarType: normalizedWebinarType }),
  };

  const educatorIdentifier = educatorID || payloadEducatorId || educatorId;
  if (educatorIdentifier) {
    payload.educatorID = educatorIdentifier;
  }

  return payload;
};

export const createWebinar = async (educatorId, webinarData) => {
  try {
    const payload = normalizeWebinarPayload(webinarData, educatorId, {
      applyDefaults: true,
    });
    const response = await API_CLIENT.post(`/api/webinars`, payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error creating webinar:", error);
    throw error;
  }
};

export const updateWebinar = async (webinarId, webinarData) => {
  try {
    const payload = normalizeWebinarPayload(webinarData);
    const response = await API_CLIENT.put(
      `/api/webinars/${webinarId}`,
      payload,
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
    const response = await API_CLIENT.delete(`/api/webinars/${webinarId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting webinar:", error);
    throw error;
  }
};

export const getWebinarById = async (webinarId) => {
  try {
    const response = await API_CLIENT.get(`/api/webinars/${webinarId}`, {
      headers: getAuthHeaders(),
    });
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

// Post APIs
export const getEducatorPosts = async (educatorId, params = {}) => {
  if (!educatorId) {
    throw new Error("Educator ID is required to fetch posts");
  }

  try {
    const response = await API_CLIENT.get(`/api/posts/educator/${educatorId}`, {
      headers: getAuthHeaders(),
      params,
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error fetching educator posts:", error);
    throw error;
  }
};

export const createEducatorPost = async (postData) => {
  try {
    const response = await API_CLIENT.post("/api/posts", postData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const updateEducatorPost = async (postId, postData) => {
  try {
    const response = await API_CLIENT.put(`/api/posts/${postId}`, postData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

export const deleteEducatorPost = async (postId) => {
  try {
    const response = await API_CLIENT.delete(`/api/posts/${postId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

// Broadcast Message to Followers API
export const sendBroadcastMessage = async (educatorId, { title, message }) => {
  if (!educatorId) {
    throw new Error("Educator ID is required to send broadcast message");
  }
  if (!title || !message) {
    throw new Error("Title and message are required");
  }

  try {
    const response = await API_CLIENT.post(
      `/api/educators/${educatorId}/broadcast`,
      { title, message },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending broadcast message:", error);
    throw error;
  }
};

export const getBroadcastHistory = async (educatorId, params = {}) => {
  if (!educatorId) {
    throw new Error("Educator ID is required to fetch broadcast history");
  }

  try {
    const response = await API_CLIENT.get(
      `/api/educators/${educatorId}/broadcast-history`,
      {
        headers: getAuthHeaders(),
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching broadcast history:", error);
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

// Get all students enrolled in educator's courses
export const getEducatorEnrolledStudents = async (educatorId) => {
  if (!educatorId) {
    throw new Error("Educator ID is required");
  }

  try {
    const response = await API_CLIENT.get(
      `/api/students/educator/${educatorId}/enrolled`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching enrolled students:", error);
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
    const payload = response.data;
    return payload?.data ?? payload;
  } catch (error) {
    console.error("Error fetching educator questions:", error);
    throw error;
  }
};

export const getEducatorTests = async (educatorId, params = {}) => {
  try {
    const response = await API_CLIENT.get(`/api/tests/educator/${educatorId}`, {
      headers: getAuthHeaders(),
      params,
    });
    const payload = response.data;
    return payload?.data ?? payload;
  } catch (error) {
    console.error("Error fetching educator tests:", error);
    throw error;
  }
};

export const getTestById = async (testId) => {
  try {
    const response = await API_CLIENT.get(`/api/tests/${testId}`, {
      headers: getAuthHeaders(),
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error fetching test:", error);
    throw error;
  }
};

export const createLiveTest = async (testData) => {
  try {
    const response = await API_CLIENT.post("/api/tests", testData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error creating test:", error);
    throw error;
  }
};

export const updateLiveTest = async (testId, testData) => {
  try {
    const response = await API_CLIENT.put(`/api/tests/${testId}`, testData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error updating test:", error);
    throw error;
  }
};

export const deleteLiveTest = async (testId) => {
  try {
    const response = await API_CLIENT.delete(`/api/tests/${testId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting test:", error);
    throw error;
  }
};

// Query APIs
export const getEducatorQueries = async (educatorId, params = {}) => {
  const response = await API_CLIENT.get(`/api/queries/educator/${educatorId}`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

export const replyToQuery = async (queryId, message) => {
  const response = await API_CLIENT.post(
    `/api/queries/${queryId}/reply`,
    { message },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const updateQueryReply = async (messageId, content) => {
  const response = await API_CLIENT.put(
    `/api/queries/messages/${messageId}`,
    { content },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const resolveQuery = async (queryId) => {
  const response = await API_CLIENT.put(
    `/api/queries/${queryId}/resolve`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ============================================================
// Admin-Educator Chat APIs
// ============================================================

// Get all conversations for current educator
export const getConversations = async () => {
  try {
    const response = await API_CLIENT.get("/api/chat/conversations", {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

// Create or get existing conversation with admin
export const createConversation = async () => {
  try {
    const response = await API_CLIENT.post(
      "/api/chat/conversations",
      {}, // Empty body - educator's conversation is auto-created with super admin
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

// Get messages for a conversation
export const getConversationMessages = async (
  conversationId,
  page = 1,
  limit = 50
) => {
  try {
    const response = await API_CLIENT.get(
      `/api/chat/conversations/${conversationId}/messages`,
      {
        headers: getAuthHeaders(),
        params: { page, limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Send a message (REST fallback - prefer WebSocket for real-time)
export const sendChatMessage = async ({
  conversationId,
  receiverId,
  receiverType,
  content,
  messageType = "text",
  attachments = [],
}) => {
  try {
    const response = await API_CLIENT.post(
      "/api/chat/messages",
      {
        conversationId,
        receiverId,
        receiverType,
        content,
        messageType,
        attachments,
      },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId) => {
  try {
    const response = await API_CLIENT.put(
      `/api/chat/messages/${messageId}/read`,
      {},
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
};

// Get unread message count
export const getUnreadMessageCount = async () => {
  try {
    const response = await API_CLIENT.get("/api/chat/unread-count", {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};
