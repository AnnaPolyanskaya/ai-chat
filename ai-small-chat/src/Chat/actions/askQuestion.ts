import axiosInstance from "@/utils/axiosInstance";

export const askQuestion = async (question: string): Promise<{ answer: string }> => {
  const response = await axiosInstance.post("/api/ask", { question });
  return response.data;
};
