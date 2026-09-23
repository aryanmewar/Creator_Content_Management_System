import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { instructorService } from '../services/instructorService.js';

const InstructorContext = createContext(null);

const initialState = {
  instructors: [],
  pagination: null,
  selectedInstructor: null,
  isLoading: false,
  error: null,
};

const instructorReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, isLoading: action.payload, error: null };
    case 'SET_ERROR': return { ...state, isLoading: false, error: action.payload };
    case 'SET_INSTRUCTORS': return { ...state, instructors: action.payload.data, pagination: action.payload.pagination, isLoading: false };
    case 'SET_SELECTED': return { ...state, selectedInstructor: action.payload, isLoading: false };
    case 'ADD_INSTRUCTOR': return { ...state, instructors: [action.payload, ...state.instructors] };
    case 'UPDATE_INSTRUCTOR': return {
      ...state,
      instructors: state.instructors.map((i) => i._id === action.payload._id ? action.payload : i),
      selectedInstructor: state.selectedInstructor?._id === action.payload._id ? action.payload : state.selectedInstructor,
    };
    default: return state;
  }
};

export const InstructorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(instructorReducer, initialState);

  const fetchInstructors = useCallback(async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await instructorService.getInstructors(params);
      dispatch({ type: 'SET_INSTRUCTORS', payload: response });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || 'Failed to load instructors.' });
    }
  }, []);

  const fetchInstructorById = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await instructorService.getInstructorById(id);
      dispatch({ type: 'SET_SELECTED', payload: response.data });
      return response.data;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || 'Failed to load instructor.' });
    }
  }, []);

  const value = { ...state, dispatch, fetchInstructors, fetchInstructorById };
  return <InstructorContext.Provider value={value}>{children}</InstructorContext.Provider>;
};

export const useInstructorContext = () => {
  const ctx = useContext(InstructorContext);
  if (!ctx) throw new Error('useInstructorContext must be used within InstructorProvider');
  return ctx;
};
