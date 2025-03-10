import httpClient from './httpClient'

const endpoint = '/api/Users'

export const getUsers = () => {
    return httpClient.get(`${endpoint}?includeAll=true`)
}

export const getUserById = (id) => {
    console.log(`Fetching user with ID: ${id} from ${endpoint}/${id}`);
    return httpClient.get(`${endpoint}/${id}`)
}

export const createUser = (createUserDto) => {
    return httpClient.post(endpoint, createUserDto)
}

export const updateUser = (id, updateUserDto) => {
    console.log(`Updating user with ID: ${id}`, updateUserDto);
    return httpClient.put(`${endpoint}/${id}`, updateUserDto)
}

export const deleteUser = (id) => {
    return httpClient.delete(`${endpoint}/${id}`)
}
