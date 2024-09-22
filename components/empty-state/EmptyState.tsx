import React, { FC, HTMLAttributes, ReactElement, ReactNode } from "react";

import { Card } from "@/components";
import EmptyDataIcon from "@/components/Icons/EmptyDataIcon";
import { classNames } from "@/utils";

import { Icon, Typography } from "@msaaqcom/abjad";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  content?: string;
  className?: string;
  action?: ReactNode;
  icon?: ReactElement;
}

const EmptyState: FC<EmptyStateProps> = ({ title, content, action, className, children, icon, ...props }) => {
  return (
    <Card>
      {/* className="min-h-[theme(spacing.64)]" */}
      <Card.Body>
        <div
          className={classNames("m-auto flex flex-col items-center justify-center space-y-6 py-10", className)}
          {...props}
        >
          {icon && (
            <div className="flex flex-col items-center justify-center">
              {icon?.type === Icon ? (
                icon
              ) : (
                <>
                  <EmptyDataIcon />
                  <Icon
                    size="md"
                    className="-mt-6 ml-2"
                    children={icon}
                  />
                </>
              )}
            </div>
          )}

          <div className="flex flex-col text-center">
            {title && (
              <Typography.Paragraph
                size="lg"
                weight="bold"
                className="mb-2"
                children={title}
              />
            )}

            {content && (
              <Typography.Paragraph
                size="md"
                weight="medium"
                children={content}
                style={{ maxWidth: "450px" }}
              />
            )}
            {action && action}
          </div>

          {children}
        </div>
      </Card.Body>
    </Card>
  );
};

export default EmptyState;
