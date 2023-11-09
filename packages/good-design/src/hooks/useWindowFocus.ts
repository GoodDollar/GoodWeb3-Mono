// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect, useState } from "react";

/**
to catch which window is focused
@returns {string} title of the focused window
*/
export const useWindowFocus = () => {
  const [title, setTitle] = useState("");

  useEffect(() => {
    window && window.focus(); // first force on main window
    if (window) {
      const checkFocus = () => {
        if (document.activeElement === document.querySelector("iframe")) {
          const { title } = document.activeElement as any;
          setTitle(title);
        } else {
          setTitle("");
        }
      };

      window.addEventListener("focus", checkFocus);
      window.addEventListener("blur", checkFocus);
      return () => {
        window.removeEventListener("blur", checkFocus);
        window.removeEventListener("focus", checkFocus);
      };
    }
  }, []);

  return { title };
};
