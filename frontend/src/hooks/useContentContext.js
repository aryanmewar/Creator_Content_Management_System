import { useContext } from "react";
import ContentContext from "../context/ContentContext.jsx";

const useContentContext = () => {
  const ctx = useContext(ContentContext);
  if (!ctx)
    throw new Error("useContentContext must be used within ContentProvider");
  return ctx;
};

export { useContentContext };
export default useContentContext;
