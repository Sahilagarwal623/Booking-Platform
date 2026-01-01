import api from './axios';

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ORGANIZER' | 'ADMIN';
    phone?: string;
    createdAt: string;
}

export interface UpdateProfileData {
    name?: string;
    phone?: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export const UserService = {
    getProfile: async () => {
        const response = await api.get<{ success: boolean; data: UserProfile }>('/users/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileData) => {
        const response = await api.put<{ success: boolean; data: UserProfile }>('/users/profile', data);
        return response.data;
    },

    changePassword: async (data: ChangePasswordData) => {
        const response = await api.put<{ success: boolean; message: string }>('/users/change-password', data);
        return response.data;
    }
};
