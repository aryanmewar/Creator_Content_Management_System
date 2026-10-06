import { useContext } from "react";
import InstructorContext from "../context/InstructorContext.jsx";

const useInstructorContext = () => {
  const ctx = useContext(InstructorContext);
  if (!ctx)
    throw new Error(
      "useInstructorContext must be used within InstructorProvider",
    );
  return ctx;
};

export { useInstructorContext };
export default useInstructorContext;
