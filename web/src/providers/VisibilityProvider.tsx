import React, {
  Context,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNuiEvent } from "../hooks/useNuiEvent";
import { fetchNui } from "../utils/fetchNui";
import { isEnvBrowser } from "../utils/misc";

const VisibilityCtx = createContext<VisibilityProviderValue | null>(null);

interface VisibilityProviderValue {
  setVisible: (visible: boolean) => void;
  visible: boolean;
}

export const VisibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(isEnvBrowser());

  useNuiEvent<boolean>("setVisible", setVisible);

  const handleClose = async () => {
    setVisible(false);
    if (!isEnvBrowser()) {
      await fetchNui("hideFrame");
    }
  };

  useEffect(() => {
    if (!visible) return;

    const keyHandler = (e: KeyboardEvent) => {
      if (["Backspace", "Escape"].includes(e.code)) {
        handleClose();
      }
    };

    window.addEventListener("keydown", keyHandler);

    return () => window.removeEventListener("keydown", keyHandler);
  }, [visible]);

  return (
    <VisibilityCtx.Provider
      value={{
        visible,
        setVisible,
      }}
    >
      {children}
    </VisibilityCtx.Provider>
  );
};

export const useVisibility = () => {
  const visibilityContext = useContext(VisibilityCtx);
  if (!visibilityContext) {
    throw new Error("useVisibility must be used within a VisibilityProvider");
  }
  return visibilityContext;
};
