import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { contentService } from "../services/contentService.js";

const ContentContext = createContext(null);

const initialState = {
  contents: [],
  pagination: null,
  selectedContent: null,
  isLoading: false,
  error: null,
  filters: {
    search: "",
    status: "",
    contentType: "",
    instructor: "",
    page: 1,
    limit: 20,
  },
};

const contentReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload, error: null };
    case "SET_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "SET_CONTENT":
      return {
        ...state,
        contents: action.payload.data,
        pagination: action.payload.pagination,
        isLoading: false,
      };
    case "SET_SELECTED":
      return { ...state, selectedContent: action.payload, isLoading: false };
    case "ADD_CONTENT":
      return { ...state, contents: [action.payload, ...state.contents] };
    case "UPDATE_CONTENT":
      return {
        ...state,
        contents: state.contents.map((c) =>
          c._id === action.payload._id ? action.payload : c,
        ),
        selectedContent:
          state.selectedContent?._id === action.payload._id
            ? action.payload
            : state.selectedContent,
      };
    case "REMOVE_CONTENT":
      return {
        ...state,
        contents: state.contents.filter((c) => c._id !== action.payload),
      };
    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload, page: 1 },
      };
    case "SET_PAGE":
      return { ...state, filters: { ...state.filters, page: action.payload } };
    default:
      return state;
  }
};

export const ContentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(contentReducer, initialState);

  const fetchContent = useCallback(
    async (params = {}) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await contentService.getContent({
          ...state.filters,
          ...params,
        });
        dispatch({ type: "SET_CONTENT", payload: response });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: err.response?.data?.message || "Failed to load content.",
        });
      }
    },
    [state.filters],
  );

  const fetchContentById = useCallback(async (id) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await contentService.getContentById(id);
      dispatch({ type: "SET_SELECTED", payload: response.data });
      return response.data;
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err.response?.data?.message || "Failed to load content.",
      });
    }
  }, []);

  const value = { ...state, dispatch, fetchContent, fetchContentById };
  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
};

export const useContentContext = () => {
  const ctx = useContext(ContentContext);
  if (!ctx)
    throw new Error("useContentContext must be used within ContentProvider");
  return ctx;
};
