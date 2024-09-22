import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Time, UserAvatar } from "@/components";
import { isDefaultRoleType, useConfirmableDelete } from "@/hooks";
import { useDeleteUserMutation } from "@/store/slices/api/usersSlice";
import { User } from "@/types";

import {
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  InboxIcon,
  PencilSquareIcon,
  TrashIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

import { Badge, Button, Dropdown, Icon } from "@msaaqcom/abjad";

export interface UsersColumnsProps {
  sortables: Array<string>;
  editHandler: (user: User) => void;
  confirmableDelete: (user: User) => Promise<void>;
  deactivateUserHandler: (user: User) => Promise<void>;
  activateUserHandler: (user: User) => Promise<void>;
  restPasswordHandler: (user: User) => Promise<void>;
}

const UserCols = ({
  sortables = [],
  editHandler,
  deactivateUserHandler,
  activateUserHandler,
  restPasswordHandler
}: UsersColumnsProps) => [
  {
    Header: <Trans i18nKey="team.member">member</Trans>,
    id: "user",
    accessor: "user",
    disableSortBy: true,
    width: 250,
    Cell: ({ row: { original } }: CellProps<User>) => {
      return (
        <UserAvatar
          user={original}
          isMember={false}
        />
      );
    }
  },
  {
    Header: <Trans i18nKey="team.status">status</Trans>,
    id: "status",
    accessor: "status",
    disableSortBy: true,
    width: "133px",
    Cell: ({
      row: {
        original: { status }
      }
    }: CellProps<User>) => (
      <Badge
        size="xs"
        soft
        rounded
        variant={status == "active" ? "success" : status == "pending" ? "warning" : "danger"}
      >
        <Trans i18nKey={`team.${status}`}>{status}</Trans>
      </Badge>
    )
  },
  {
    Header: <Trans i18nKey="team.last_seen">last seen</Trans>,
    id: "last_seen_at",
    accessor: "last_seen_at",
    disableSortBy: !sortables?.includes("last_seen_at"),
    Cell: ({
      row: {
        original: { last_seen_at }
      }
    }: CellProps<User>) => (last_seen_at ? <Time date={last_seen_at} /> : "-")
  },
  {
    Header: <Trans i18nKey="team.joined_at">joined at</Trans>,
    id: "created_at",
    accessor: "created_at",
    disableSortBy: !sortables?.includes("created_at"),
    Cell: ({
      row: {
        original: { created_at }
      }
    }: CellProps<User>) => <Time date={created_at} />
  },
  {
    Header: <Trans i18nKey="team.role">role</Trans>,
    id: "roles",
    accessor: "roles",
    disableSortBy: !sortables?.includes("roles"),
    Cell: ({
      row: {
        original: { roles }
      }
    }: CellProps<User>) => {
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => {
            return (
              <Badge
                size="xs"
                soft
                rounded
                variant={role.name == "super-admin" ? "purple" : role.name == "instructor" ? "orange" : "info"}
                key={role.id}
              >
                {isDefaultRoleType(role.name) ? (
                  <Trans i18nKey={`team.${role.name}`}>{role.name}</Trans>
                ) : (
                  <Trans i18nKey={`role.nickname`}>{role.nickname}</Trans>
                )}
              </Badge>
            );
          })}
        </div>
      );
    }
  },
  {
    id: "actions",
    className: "justify-end",

    Cell: ({ row: { original } }: CellProps<User>) => {
      const { t } = useTranslation();
      const [confirmableDelete] = useConfirmableDelete({
        mutation: useDeleteUserMutation
      });

      return (
        <div className="flex flex-row">
          {original.status !== "pending" && (
            <Button
              onClick={() => editHandler(original)}
              variant="default"
              size="sm"
              className="ml-2"
              children={<Trans i18nKey="edit">Edit</Trans>}
            />
          )}

          <Dropdown>
            <Dropdown.Trigger>
              <Button
                variant="default"
                size="sm"
                icon={
                  <Icon
                    size="md"
                    children={<EllipsisHorizontalIcon />}
                  />
                }
              />
            </Dropdown.Trigger>
            <Dropdown.Menu>
              {original.status != "pending" && (
                <>
                  <Dropdown.Item
                    onClick={() => editHandler(original)}
                    children={t("edit")}
                    iconAlign="end"
                    icon={
                      <Icon
                        size="sm"
                        children={<PencilSquareIcon />}
                      />
                    }
                  />
                  {(!original.roles.length || original?.roles.some((role) => role.name !== "super-admin")) && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        children={
                          original.status == "active" ? (
                            <Trans i18nKey="team.deactivate_account">deactivate account</Trans>
                          ) : (
                            <Trans i18nKey="team.activate_account">active account</Trans>
                          )
                        }
                        iconAlign="end"
                        icon={
                          <Icon
                            size="sm"
                            children={original.status == "active" ? <XCircleIcon /> : <CheckCircleIcon />}
                          />
                        }
                        onClick={() =>
                          original.status == "active" ? deactivateUserHandler(original) : activateUserHandler(original)
                        }
                      />
                      <Dropdown.Divider />

                      <Dropdown.Item
                        children={<Trans i18nKey="students_flow.rest_password_link">rest password link</Trans>}
                        iconAlign="end"
                        icon={
                          <Icon
                            size="sm"
                            children={<InboxIcon />}
                          />
                        }
                        onClick={() => restPasswordHandler(original)}
                      />
                      <Dropdown.Divider />
                    </>
                  )}
                </>
              )}
              <Dropdown.Item
                className="text-red-500"
                children={<Trans i18nKey="team.delete_user">delete user</Trans>}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<TrashIcon />}
                  />
                }
                onClick={() => {
                  confirmableDelete({
                    id: original.id,
                    title: t("team.delete_user_confirm"),
                    label: t("team.delete_user_confirm"),
                    children: t("team.delete_user_confirm_message")
                  });
                }}
              />
              <Dropdown.Divider />
            </Dropdown.Menu>
          </Dropdown>
        </div>
      );
    }
  }
];

export default UserCols;
