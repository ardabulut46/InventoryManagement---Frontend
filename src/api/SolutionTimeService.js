import httpClient from './httpClient';

const endpoint = '/api/SolutionTime';

const SolutionTimeService = {
  getAllSolutionTimes: () => {
    return httpClient.get(endpoint);
  },

  getSolutionTime: (id) => {
    return httpClient.get(`${endpoint}/${id}`);
  },

  getBySolutionType: (solutionTypeId) => {
    return httpClient.get(`${endpoint}/by-solution-type/${solutionTypeId}`);
  },

  createSolutionTime: (solutionTime) => {
    return httpClient.post(endpoint, solutionTime);
  },

  updateSolutionTime: (id, solutionTime) => {
    return httpClient.put(`${endpoint}/${id}`, solutionTime);
  },

  deleteSolutionTime: (id) => {
    return httpClient.delete(`${endpoint}/${id}`);
  }
};

export default SolutionTimeService; 