import { ReactNode, createContext, useContext, useEffect, useState } from "react";

import MobileVerificationModal from "@/components/MobileVerificationModal";

import { AuthContext } from "./AuthContext";

const PhoneVerificationContext = createContext<{ openOTPModal: () => void }>(
  {} as {
    openOTPModal: () => void;
  }
);

const PhoneVerificationProvider = ({ children }: { children: ReactNode }) => {
  const { user, authenticated } = useContext(AuthContext);
  const [showOTPModal, setShowOTPModal] = useState<boolean>(false);

  const openOTPModal = () => {
    setShowOTPModal(true);
  };

  if (!authenticated) {
    return <PhoneVerificationContext.Provider value={{ openOTPModal }}>{children}</PhoneVerificationContext.Provider>;
  }
  useEffect(() => {
    if (user && !user.phone_verified) {
      setShowOTPModal(true);
    }
  }, [user]);

  return (
    <PhoneVerificationContext.Provider value={{ openOTPModal }}>
      {children}
      <MobileVerificationModal
        open={showOTPModal}
        onDismiss={() => {
          setShowOTPModal(false);
        }}
      />
    </PhoneVerificationContext.Provider>
  );
};

export { PhoneVerificationContext, PhoneVerificationProvider };
