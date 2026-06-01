"use client";

import { useEffect } from "react";
import ReactGA from "react-ga4";

export default function GoogleAnalytics() {
  useEffect(() => {
    ReactGA.initialize(process.env.NEXT_PUBLIC_GA_ID!);
  }, []);

  return null;
}
