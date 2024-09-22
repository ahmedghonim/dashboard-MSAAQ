import React from "react";

import Link from "next/link";

import { DeepPartial } from "redux";

import { Member, User } from "@/types";

import { CheckBadgeIcon } from "@heroicons/react/24/solid";

import { Avatar, Icon, Title, Tooltip, Typography } from "@msaaqcom/abjad";
import { TitleProps } from "@msaaqcom/abjad/dist/components/title/Title";

interface Props extends DeepPartial<TitleProps> {
  user: User | Member;
  isMember?: boolean;
}

const UserAvatar = ({ user, isMember = true, ...props }: Props) => {
  const Component = () => (
    <Title
      title={user.name}
      subtitle={
        <span className="flex items-center">
          {user.email ? (
            <Tooltip>
              <Tooltip.Trigger asChild>
                <span className="relative flex w-[150px] items-center">
                  <span className="relative flex w-[100px]">
                    <Typography.Paragraph
                      as="span"
                      className="mid-truncate"
                      data-text={user.email}
                      children={user.email}
                    />
                  </span>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content dir="auto">{user.email}</Tooltip.Content>
            </Tooltip>
          ) : (
            <Typography.Paragraph
              as="span"
              className="ml-2"
            >
              {user.international_phone}
            </Typography.Paragraph>
          )}
          {(user.is_verified || user.email_verified) && (
            <Icon
              size="sm"
              color="info"
              children={<CheckBadgeIcon className="text-info-600" />}
            />
          )}
        </span>
      }
      prepend={
        <Avatar
          imageUrl={user?.avatar?.url}
          name={user.name}
        />
      }
      {...props}
    />
  );

  return isMember && user.id ? (
    <Link
      href={`/students/${user.id}`}
      children={<Component />}
      className={props.className}
    />
  ) : (
    <Component />
  );
};

export default UserAvatar;
