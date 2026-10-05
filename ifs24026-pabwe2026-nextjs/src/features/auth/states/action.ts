export const AUTH_LOGIN = "auth/login";
export const AUTH_REGISTER = "auth/register";
export const AUTH_LOGOUT = "auth/logout";

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface AuthRegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const authLoginAction = (payload: AuthLoginPayload) => ({
  type: AUTH_LOGIN,
  payload,
});

export const authRegisterAction = (payload: AuthRegisterPayload) => ({
  type: AUTH_REGISTER,
  payload,
});

export const authLogoutAction = () => ({
  type: AUTH_LOGOUT,
});