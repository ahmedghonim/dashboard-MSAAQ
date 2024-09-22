import { FC, ReactNode, useContext } from "react";

import { EmailVerificationAlert, SubscribeButton } from "@/components";
import { AuthContext } from "@/contextes";
import { useIsRouteActive } from "@/hooks";
import { classNames } from "@/utils";

interface ContainerProps {
  className?: string;
  children: ReactNode;
}

const Container: FC<ContainerProps> = ({ children, className, ...props }) => {
  const { current_academy } = useContext(AuthContext);
  const { isActive } = useIsRouteActive();

  return (
    <div
      className={classNames("container", "relative", className, className?.includes("py") ? "" : "py-6")}
      {...props}
    >
      <EmailVerificationAlert />

      {children}
      {isActive("/") && current_academy.on_trial && <SubscribeButton />}
    </div>
  );
};

type ContainerComponent<P = {}> = FC<P>;

export default Container as ContainerComponent<ContainerProps>;
