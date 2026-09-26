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
  statusCounts: {},
  selectedContent: null,
  isLoading: false,
  error: null,
  filters: {
    search: "",
    status: "",
    contentType: "",
    instructor: "",
    page: 1,
    limit: 50,
    sortBy: "publishedDate",
    sortOrder: "desc",
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
        statusCounts: action.payload.statusCounts || {},
        isLoading: false,
      };
    case "SET_SELECTED":
      return { ...state, selectedContent: action.payload, isLoading: false };
    case "ADD_CONTENT": {
      const newContents = [action.payload, ...state.contents];
      if (
        state.filters.sortBy === "publishedDate" &&
        state.filters.sortOrder === "desc"
      ) {
        newContents.sort((a, b) => {
          const priorityA = a.status === "DRAFT" ? 0 : 1;
          const priorityB = b.status === "DRAFT" ? 0 : 1;

          if (priorityA !== priorityB) return priorityA - priorityB;

          // Same priority group
          const dateA = ["PUBLISHED", "SCHEDULED"].includes(a.status)
            ? a.publishedDate || a.scheduledDate || a.updatedAt
            : a.status === "DRAFT"
              ? a.updatedAt || a.createdAt
              : a.completionDate || a.updatedAt || a.createdAt;

          const dateB = ["PUBLISHED", "SCHEDULED"].includes(b.status)
            ? b.publishedDate || b.scheduledDate || b.updatedAt
            : b.status === "DRAFT"
              ? b.updatedAt || b.createdAt
              : b.completionDate || b.updatedAt || b.createdAt;

          const timeA = dateA ? new Date(dateA).getTime() : 0;
          const timeB = dateB ? new Date(dateB).getTime() : 0;
          return timeB - timeA;
        });
      }
      return { ...state, contents: newContents };
    }
    case "UPDATE_CONTENT": {
      const updatedContents = state.contents.map((c) =>
        c._id === action.payload._id ? action.payload : c,
      );

      if (
        state.filters.sortBy === "publishedDate" &&
        state.filters.sortOrder === "desc"
      ) {
        updatedContents.sort((a, b) => {
          const priorityA = a.status === "DRAFT" ? 0 : 1;
          const priorityB = b.status === "DRAFT" ? 0 : 1;

          if (priorityA !== priorityB) return priorityA - priorityB;

          // Same priority group
          const dateA = ["PUBLISHED", "SCHEDULED"].includes(a.status)
            ? a.publishedDate || a.scheduledDate || a.updatedAt
            : a.status === "DRAFT"
              ? a.updatedAt || a.createdAt
              : a.completionDate || a.updatedAt || a.createdAt;

          const dateB = ["PUBLISHED", "SCHEDULED"].includes(b.status)
            ? b.publishedDate || b.scheduledDate || b.updatedAt
            : b.status === "DRAFT"
              ? b.updatedAt || b.createdAt
              : b.completionDate || b.updatedAt || b.createdAt;

          const timeA = dateA ? new Date(dateA).getTime() : 0;
          const timeB = dateB ? new Date(dateB).getTime() : 0;
          return timeB - timeA;
        });
      }

      return {
        ...state,
        contents: updatedContents,
        selectedContent:
          state.selectedContent?._id === action.payload._id
            ? action.payload
            : state.selectedContent,
      };
    }
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
