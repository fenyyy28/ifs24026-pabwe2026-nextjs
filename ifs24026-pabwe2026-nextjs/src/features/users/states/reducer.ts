import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  changeProfilePassword as changeProfilePasswordApi,
  getMyProfile,
  getUsers,
  updateProfile,
  updateProfilePhoto,
  type User,
  type UserProfile,
} from "@/features/users/api/userApi";

interface UsersState {
  users: User[];
  user: User | null;
  profile: UserProfile | null;

  isProfile: boolean;
  isChangeProfile: boolean;
  isChangeProfilePhoto: boolean;
  isChangeProfilePassword: boolean;

  error: string | null;
}

const initialState: UsersState = {
  users: [],
  user: null,
  profile: null,

  isProfile: false,
  isChangeProfile: false,
  isChangeProfilePhoto: false,
  isChangeProfilePassword: false,

  error: null,
};

export const fetchUsers = createAsyncThunk(
  "users/getUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUsers();

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data pengguna."
      );
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "users/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyProfile();

      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Gagal mengambil profil pengguna."
      );
    }
  }
);

export const changeProfile = createAsyncThunk(
  "users/changeProfile",
  async (
    payload: {
      name: string;
      bio: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateProfile(payload);

      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui profil."
      );
    }
  }
);

export const changeProfilePhoto = createAsyncThunk(
  "users/changeProfilePhoto",
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await updateProfilePhoto(file);

      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui foto profil."
      );
    }
  }
);

export const changeProfilePassword = createAsyncThunk(
  "users/changeProfilePassword",
  async (
    payload: {
      old_password: string;
      new_password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response =
        await changeProfilePasswordApi(payload);

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Gagal mengubah password."
      );
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(fetchProfile.pending, (state) => {
        state.isProfile = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isProfile = false;
        state.profile = action.payload;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isProfile = false;
        state.error = action.payload as string;
      })

      .addCase(changeProfile.pending, (state) => {
        state.isChangeProfile = true;
        state.error = null;
      })
      .addCase(changeProfile.fulfilled, (state, action) => {
        state.isChangeProfile = false;
        state.profile = action.payload;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(changeProfile.rejected, (state, action) => {
        state.isChangeProfile = false;
        state.error = action.payload as string;
      })

      .addCase(changeProfilePhoto.pending, (state) => {
        state.isChangeProfilePhoto = true;
        state.error = null;
      })
      .addCase(
        changeProfilePhoto.fulfilled,
        (state, action) => {
          state.isChangeProfilePhoto = false;
          state.profile = action.payload;
          state.user = action.payload;
          state.error = null;
        }
      )
      .addCase(
        changeProfilePhoto.rejected,
        (state, action) => {
          state.isChangeProfilePhoto = false;
          state.error = action.payload as string;
        }
      )

      .addCase(changeProfilePassword.pending, (state) => {
        state.isChangeProfilePassword = true;
        state.error = null;
      })
      .addCase(
        changeProfilePassword.fulfilled,
        (state) => {
          state.isChangeProfilePassword = false;
          state.error = null;
        }
      )
      .addCase(
        changeProfilePassword.rejected,
        (state, action) => {
          state.isChangeProfilePassword = false;
          state.error = action.payload as string;
        }
      );
  },
});

export default usersSlice.reducer;