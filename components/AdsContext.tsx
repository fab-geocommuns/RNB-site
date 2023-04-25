import { createContext } from "react";
import ADS  from "@/logic/ads";

export const AdsContext = createContext({
    ads: null,
    setAds: (ads: ADS) => {}
});