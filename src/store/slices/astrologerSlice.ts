import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Astrologer, UpdateAstrologerRequest } from '@/types';

interface AstrologerState {
  currentAstrologer: Astrologer | null;
  isLoading: boolean;
  isSaving: boolean;
  isUploading: boolean;
  error: string | null;
}

const initialState: AstrologerState = {
  currentAstrologer: null,
  isLoading: false,
  isSaving: false,
  isUploading: false,
  error: null,
};

const astrologerSlice = createSlice({
  name: 'astrologer',
  initialState,
  reducers: {
    fetchAstrologerRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchAstrologerSuccess: (state, action: PayloadAction<Astrologer>) => {
      state.isLoading = false;
      state.currentAstrologer = action.payload;
      state.error = null;
    },
    fetchAstrologerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    updateAstrologerRequest: (state, _action: PayloadAction<{ id: string; data: UpdateAstrologerRequest; callback?: () => void }>) => {
      state.isSaving = true;
      state.error = null;
    },
    updateAstrologerSuccess: (state, action: PayloadAction<Astrologer>) => {
      state.isSaving = false;
      state.currentAstrologer = action.payload;
      state.error = null;
    },
    updateAstrologerFailure: (state, action: PayloadAction<string>) => {
      state.isSaving = false;
      state.error = action.payload;
    },

    uploadProfilePictureRequest: (state, _action: PayloadAction<{ id: string; file: File }>) => {
      state.isUploading = true;
      state.error = null;
    },
    uploadProfilePictureSuccess: (state, action: PayloadAction<string>) => {
      state.isUploading = false;
      if (state.currentAstrologer) {
        state.currentAstrologer.profilePicture = action.payload;
      }
      state.error = null;
    },
    uploadProfilePictureFailure: (state, action: PayloadAction<string>) => {
      state.isUploading = false;
      state.error = action.payload;
    },

    clearAstrologer: (state) => {
      state.currentAstrologer = null;
      state.isLoading = false;
      state.isSaving = false;
      state.isUploading = false;
      state.error = null;
    },
  },
});

export const {
  fetchAstrologerRequest,
  fetchAstrologerSuccess,
  fetchAstrologerFailure,
  updateAstrologerRequest,
  updateAstrologerSuccess,
  updateAstrologerFailure,
  uploadProfilePictureRequest,
  uploadProfilePictureSuccess,
  uploadProfilePictureFailure,
  clearAstrologer,
} = astrologerSlice.actions;

export default astrologerSlice.reducer;

