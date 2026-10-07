import { apiFetch } from "@/helpers/apiHelper";

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  bio: string | null;
  photo: string | null;
}

export interface UsersResponse {
  status: string;
  message: string;
  data: User[];
}

export interface UserResponse {
  status: string;
  message: string;
  data: User;
}

export interface ProfileResponse {
  status: string;
  message: string;
  data: {
    user: UserProfile;
  };
}

export interface UpdateProfileRequest {
  name: string;
  bio: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export async function getUsers(): Promise<UsersResponse> {
  return apiFetch<UsersResponse>("/api/v1/users");
}

export async function getMyProfile(): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/api/v1/users/me");
}

export async function updateProfile(
  data: UpdateProfileRequest
): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/api/v1/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateProfilePhoto(
  file: File
): Promise<ProfileResponse> {
  const formData = new FormData();
  formData.append("photo", file);

  return apiFetch<ProfileResponse>("/api/v1/users/me/photo", {
    method: "POST",
    body: formData,
    headers: {},
  });
}

export async function changeProfilePassword(
  data: ChangePasswordRequest
): Promise<{ status: string; message: string }> {
  return apiFetch<{ status: string; message: string }>(
    "/api/v1/users/me/password",
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}