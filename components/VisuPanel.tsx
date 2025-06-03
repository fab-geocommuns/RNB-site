"use client";

// Hooks
import { useState } from "react";

// Styles
import styles from "@/styles/panel.module.scss";

// Store
import { useDispatch, useSelector } from "react-redux";

// Comps
import RNBIDHeader from "@/components/contribution/RNBIDHeader";
import ADSPanel from "@/components/panel/ADSPanel";
import BuildingPanel from "@/components/panel/BuildingPanel";
import TabPanel from "@/components/panel/TabPanel";
import { Actions, AppDispatch, RootState } from "@/stores/store";
import { useRNBFetch } from "@/utils/use-rnb-fetch";

export default function VisuPanel() {
  // Store
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const dispatch: AppDispatch = useDispatch();
  const [comment, setComment] = useState("");
  const { fetch } = useRNBFetch();

  const title = () => {
    if (selectedItem?._type === "building") {
      return "Bâtiment";
    }

    if (selectedItem?._type === "ads") {
      return "Autorisation du droit des sols";
    }

    return null;
  };

  const close = () => {
    dispatch(Actions.map.unselectItem());
  };

  if (selectedItem) {
    return (
      <>
        <div className={styles.shell} data-testid="visu-panel">
          <div className={styles.content}>
            <TabPanel />
            <RNBIDHeader>
              <div className={styles.head}>
                <h1 className={styles.title}>{title()}</h1>
                <a href="#" onClick={close} className={styles.closeLink}>
                  <i className="fr-icon-close-line" />
                </a>
              </div>
            </RNBIDHeader>

            <div className={styles.body}>
              {selectedItem?._type === "building" && (
                <BuildingPanel bdg={selectedItem} />
              )}
              {selectedItem?._type === "ads" && <ADSPanel ads={selectedItem} />}
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return <></>;
  }
}
