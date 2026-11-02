import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";

export interface HistoryEntry {
  idx: number;
  url: string;
  stepsBack: number;
}

export const useNavigationHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const maxIdxRef = useRef(0);

  useEffect(() => {
    const idx = (window.history.state?.idx as number) ?? 0;

    if (navigationType === "PUSH" || idx > maxIdxRef.current) {
      maxIdxRef.current = idx;
    }

    setTimeout(() => {
      setCanGoBack(idx > 0);
      setCanGoForward(idx < maxIdxRef.current);
    }, 0);
  }, [location, navigationType]);

  return {
    canGoBack,
    canGoForward,
    goBack: () => navigate(-1),
    goForward: () => navigate(1),
  };
};
