import API_CLIENT from "./config";

export const loginEducator = async (email, password) => {
  try {
    const response = await API_CLIENT.post("/api/auth/login-educator", {
      email,
      password,
    });
    console.log("Educator login response:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("Error logging in educator:", error);
    throw error;
  }
};
