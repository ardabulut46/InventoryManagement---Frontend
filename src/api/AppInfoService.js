import httpClient from './httpClient';

export const AppInfoService = {
    generateResponse: async (question) => {
        try {
            const response = await httpClient.get(`/api/AppInfo/ask?question=${encodeURIComponent(question)}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    generateDeepSeekResponse: async (question) => {
        try {
            const response = await httpClient.get(`/api/AppInfo/ask-deepseek?question=${encodeURIComponent(question)}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default AppInfoService; 