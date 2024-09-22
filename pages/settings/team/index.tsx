import { useEffect, useState } from "react";

import { GetServerSideProps } from "next";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { components } from "react-select";
import * as yup from "yup";

import UserCols from "@/columns/users";
import { AddonController, Layout } from "@/components";
import { confirm } from "@/components/Alerts/Confirm";
import { Datatable } from "@/components/datatable";
import { Select } from "@/components/select";
import { isDefaultRoleType, useResponseToastHandler } from "@/hooks";
import axios from "@/lib/axios";
import i18nextConfig from "@/next-i18next.config";
import { useFetchRolesQuery } from "@/store/slices/api/rolesSlice";
import { useCreateUserMutation, useFetchUsersQuery, useUpdateUserMutation } from "@/store/slices/api/usersSlice";
import { APIActionResponse, APIResponse, Media, Role, User } from "@/types";

import { PlusIcon, UserIcon } from "@heroicons/react/24/outline";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

import { Alert, Avatar, Button, Form, Icon, Modal, Tooltip, Typography } from "@msaaqcom/abjad";

type IFormInputs = {
  email: string;
  name: string;
  roles: {
    label: string;
    tooltip: string;
    value: number;
  }[];
  avatar: Media | null;
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index() {
  const { t } = useTranslation();

  const [showCreateTeamMemberModal, setShowCreateTeamMemberModal] = useState<boolean>(false);
  const [rolesList, setRolesList] = useState<any>([]);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const schema = yup.object().shape({
    email: yup.string().email().required(),
    name: yup.string().required(),
    roles: yup
      .array()
      .of(
        yup
          .object()
          .shape({
            label: yup.string().required(),
            tooltip: yup.string().required(),
            value: yup.number().required()
          })
          .required()
      )
      .min(1)
      .required(),
    avatar: yup.mixed().nullable().notRequired()
  });

  const { data: roles = {} as APIResponse<Role>, isLoading: isRolesLoading } = useFetchRolesQuery();
  useEffect(() => {
    if (!isRolesLoading && roles.data) {
      setRolesList(
        roles.data?.map(({ id, name, nickname }) => ({
          label: isDefaultRoleType(name) ? t(`team.${name}`) : nickname,
          tooltip: name,
          name: name,
          value: id
        }))
      );
    }
  }, [roles.data]);

  const {
    handleSubmit,
    reset,
    setValue,
    control,
    setError,
    formState: { errors, isValid, isSubmitting }
  } = useForm<IFormInputs>({
    mode: "all",
    resolver: yupResolver(schema)
  });

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  const [createUserMutation] = useCreateUserMutation();
  const [updateUserMutation] = useUpdateUserMutation();
  const [profilePicture, setProfilePicture] = useState<any>(null);

  useEffect(() => {
    if (userToEdit) {
      setProfilePicture(userToEdit.avatar?.url);
      reset({
        name: userToEdit.name,
        email: userToEdit.email,
        roles: userToEdit.roles.map((role) => ({
          label: isDefaultRoleType(role.name) ? t(`team.${role.name}`) : role.nickname,
          name: role.name,
          tooltip: role.name,
          value: role.id
        }))
      });
    }
  }, [userToEdit]);

  const onProfilePictureChange = (input: any) => {
    if (input.files && input.files[0]) {
      let reader = new FileReader();

      reader.onload = function (e) {
        setProfilePicture(e?.target?.result ?? "");
      };
      setValue("avatar", input.files[0], { shouldValidate: true, shouldDirty: true });
      reader.readAsDataURL(input.files[0]);
    }
  };

  const dataReset = () => {
    setUserToEdit(null);
    setShowCreateTeamMemberModal(false);
    setProfilePicture("");
    reset({
      name: "",
      email: "",
      roles: [],
      avatar: null
    });
  };

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;
    const mutation: any = userToEdit?.id ? updateUserMutation : createUserMutation;
    const isSuperAdmin = userToEdit?.roles.some((role) => role.name === "super-admin");

    const response = (await mutation({
      id: userToEdit?.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      ...(isSuperAdmin ? {} : { roles: data.roles?.map(({ value }) => value) })
    })) as APIActionResponse<User>;

    if (displayErrors(response)) return;

    displaySuccess(response);

    dataReset();
  };

  const deactivateUserHandler = async (user: User) => {
    if (
      !(await confirm({
        variant: "warning",
        okLabel: t("confirm"),
        cancelLabel: t("undo"),
        title: t("team.deactivate_user_account"),
        enableConfirmCheckbox: false,
        children: (
          <Typography.Paragraph
            size="md"
            weight="normal"
            children={t("team.deactivate_user_account_description")}
          />
        )
      }))
    ) {
      return;
    }

    const deactivateAccount = (await updateUserMutation({
      id: user?.id,
      roles: user.roles?.map((role) => role.id) as [],
      status: "inactive"
    })) as APIActionResponse<User>;

    if (displayErrors(deactivateAccount)) {
      return;
    }

    displaySuccess(deactivateAccount);
  };

  const activateUserHandler = async (user: User) => {
    if (
      !(await confirm({
        variant: "warning",
        okLabel: t("confirm"),
        cancelLabel: t("undo"),
        title: t("team.activate_user_account"),
        enableConfirmCheckbox: false,
        children: (
          <Typography.Paragraph
            size="md"
            weight="normal"
            children={t("team.activate_user_account_description")}
          />
        )
      }))
    ) {
      return;
    }

    const activateAccount = (await updateUserMutation({
      id: user?.id,
      roles: user.roles?.map((role) => role.id) as [],
      status: "active"
    })) as APIActionResponse<User>;

    if (displayErrors(activateAccount)) {
      return;
    }

    displaySuccess(activateAccount);
  };

  const ToolbarButton = () => (
    <Button
      variant="primary"
      size="md"
      children={t("team.add_new")}
      onClick={() => {
        dataReset();
        setShowCreateTeamMemberModal(true);
      }}
      icon={
        <Icon
          size="sm"
          children={<PlusIcon />}
        />
      }
    />
  );

  const restPasswordHandler = async (user: User) => {
    const data = (await axios.post(`/users/${user.id}/send-reset-password-email`, {})) as APIActionResponse<any>;
    if (displayErrors(data)) {
      return;
    }
    displaySuccess(data);
  };

  return (
    <Layout title={t("team.title")}>
      <Layout.Container>
        <AddonController addon="users">
          <Datatable
            selectable={false}
            hasFilter={false}
            columns={{
              columns: UserCols,
              props: {
                editHandler: (user: User) => {
                  setUserToEdit(user);
                  setShowCreateTeamMemberModal(true);
                },
                restPasswordHandler,
                deactivateUserHandler,
                activateUserHandler
              }
            }}
            fetcher={useFetchUsersQuery}
            toolbar={() => <ToolbarButton />}
          />
        </AddonController>

        <Modal
          size="lg"
          open={showCreateTeamMemberModal}
          onDismiss={() => {
            setShowCreateTeamMemberModal(false);
            dataReset();
          }}
        >
          <Modal.Header>
            <Modal.HeaderTitle children={userToEdit ? t("team.update") : t("team.add_new")} />
          </Modal.Header>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Body>
              <div className="px-4">
                {!userToEdit && (
                  <Alert
                    dismissible
                    onDismiss={function Pl() {}}
                    variant="info"
                  >
                    {t("team.alert_description")}
                  </Alert>
                )}
              </div>
              <label className="mt-4 flex flex-col items-center">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => onProfilePictureChange(e.target)}
                />
                {!profilePicture && (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray bg-gray-50">
                    <Icon children={<UserIcon />} />
                  </div>
                )}
                {profilePicture && (
                  <Avatar
                    size="xl"
                    name={userToEdit?.name ?? ""}
                    imageUrl={profilePicture}
                  />
                )}
                <Button
                  as="span"
                  variant="default"
                  children={
                    userToEdit?.avatar
                      ? t("students_flow.change_profile_picture")
                      : t("students_flow.upload_profile_picture")
                  }
                  className="mt-4"
                />
              </label>
              <Modal.Content className="!pb-0">
                <Form.Group
                  errors={errors.name?.message}
                  required
                  label={t("team.name")}
                >
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Form.Input
                        {...field}
                        placeholder={t("team.name")}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  errors={errors.email?.message}
                  required
                  label={t("team.email")}
                >
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Form.Input
                        {...field}
                        placeholder={t("team.email")}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  label={t("team.roles")}
                  errors={errors.roles?.message}
                  required
                >
                  <Controller
                    render={({ field }) => (
                      <Select
                        disabled={userToEdit?.roles.some((role) => role.name === "super-admin")}
                        components={{
                          MultiValueRemove: (props) => {
                            if (userToEdit?.roles.some((role) => role.name === "super-admin")) {
                              return null;
                            } else {
                              return <components.MultiValueRemove {...props} />;
                            }
                          },
                          MultiValueContainer: (props) => {
                            if (userToEdit?.roles.some((role) => role.name === "super-admin")) {
                              return <Typography.Paragraph>{props.data.label}</Typography.Paragraph>;
                            } else {
                              return <components.MultiValueContainer {...props} />;
                            }
                          },
                          Option: (props) => (
                            <components.Option {...props}>
                              <div className="flex">
                                <div className="flex items-center">
                                  <span className="mr-2">{props.data.label}</span>
                                </div>
                                {isDefaultRoleType(props.data.name) && (
                                  <Tooltip>
                                    <Tooltip.Trigger className="mr-auto">
                                      <Icon>
                                        <ExclamationCircleIcon className="text-gray-600" />
                                      </Icon>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                      {t(`team.description.${props.data.tooltip}_title`)}
                                      <ul className="list-disc px-4">
                                        {t(`team.description.${props.data.tooltip}_list`)
                                          .split(",")
                                          .map((item, index) => {
                                            return (
                                              <li
                                                key={index}
                                                className="text-decoration-none"
                                              >
                                                {item}
                                              </li>
                                            );
                                          })}
                                      </ul>
                                    </Tooltip.Content>
                                  </Tooltip>
                                )}
                              </div>
                            </components.Option>
                          )
                        }}
                        required
                        isMulti
                        placeholder={t("team.roles")}
                        options={rolesList}
                        {...field}
                      />
                    )}
                    name="roles"
                    control={control}
                  />
                </Form.Group>
              </Modal.Content>
            </Modal.Body>
            <Modal.Footer>
              <Button
                size="lg"
                className="ml-2"
                type="submit"
                children={userToEdit ? t("team.save") : t("team.submit")}
                disabled={isSubmitting || !isValid}
              />
              <Button
                ghost
                size="lg"
                variant="default"
                disabled={isSubmitting}
                children={t("cancel")}
                onClick={() => {
                  setShowCreateTeamMemberModal(false);
                }}
              />
            </Modal.Footer>
          </Form>
        </Modal>
      </Layout.Container>
    </Layout>
  );
}
