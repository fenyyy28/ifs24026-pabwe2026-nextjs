export const GET_USERS = "users/getUsers";
export const GET_PROFILE = "users/getProfile";
export const CHANGE_PROFILE = "users/changeProfile";
export const CHANGE_PROFILE_PHOTO = "users/changeProfilePhoto";
export const CHANGE_PROFILE_PASSWORD = "users/changeProfilePassword";

export const getUsersAction = () => ({
  type: GET_USERS,
});

export const getProfileAction = () => ({
  type: GET_PROFILE,
});

export const changeProfileAction = (payload: {
  name: string;
  bio: string;
}) => ({
  type: CHANGE_PROFILE,
  payload,
});

export const changeProfilePhotoAction = (payload: File) => ({
  type: CHANGE_PROFILE_PHOTO,
  payload,
});

export const changeProfilePasswordAction = (payload: {
  old_password: string;
  new_password: string;
}) => ({
  type: CHANGE_PROFILE_PASSWORD,
  payload,
});