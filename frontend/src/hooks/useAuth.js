import { useContext } from "react";
import AuthContext from "../context/AuthContext.jsx";

const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export { useAuth };
export default useAuth;
