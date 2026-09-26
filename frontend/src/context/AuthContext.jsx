import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../services/authService.js";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "INIT":
      return { ...state, ...action.payload, isLoading: false };
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    case "UPDATE_USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount — verify the HttpOnly cookie by calling /me.
  // If the cookie is valid, the server returns the user. No localStorage needed.
  useEffect(() => {
    const init = async () => {
      try {
        const response = await authService.getMe();
        dispatch({
          type: "INIT",
          payload: { user: response.data, isAuthenticated: true },
        });
      } catch {
        // Cookie absent or expired — user is not authenticated
        dispatch({ type: "INIT", payload: { isAuthenticated: false } });
      }
    };
    init();
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    // Token is now in an HttpOnly cookie — we only store the user object in state
    const { user } = response.data;
    dispatch({ type: "LOGIN", payload: { user } });
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const value = { ...state, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};
