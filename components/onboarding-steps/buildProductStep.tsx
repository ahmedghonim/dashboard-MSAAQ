import { useContext, useState } from "react";

import { useRouter } from "next/router";

import { setCookie, setCookies } from "cookies-next";
import { useTranslation } from "next-i18next";

import { CreateNewModal } from "@/components/modals";
import { AuthContext } from "@/contextes";
import { GTM_EVENTS, useAppDispatch, useGTM, useResponseToastHandler } from "@/hooks";
import { useCreateCourseMutation } from "@/store/slices/api/coursesSlice";
import { useUpdateAcademySettingsMutation } from "@/store/slices/api/settingsSlice";
import { fetchPermissions } from "@/store/slices/auth-slice";
import { APIActionResponse, Course } from "@/types";

import { Icon } from "@msaaqcom/abjad";
import {
  FileFavouriteIcon,
  PlayListFavourite02Icon,
  UserStoryIcon,
  UserSwitchIcon
} from "@msaaqcom/hugeicons/rounded/stroke";

import SkipButton from "./skipButton";

const BuildProductStep = ({ onProductOrCoaching }: { onProductOrCoaching: (value: string) => void }) => {
  const { t } = useTranslation();

  const [showCourseModal, setShowCourseModal] = useState<boolean>(false);
  const { refetchAuth } = useContext(AuthContext);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { sendGTMEvent } = useGTM();
  const { displayErrors } = useResponseToastHandler({});

  const [createCourse] = useCreateCourseMutation();
  const [skipOnboardingMutation] = useUpdateAcademySettingsMutation();

  const handleCourseCreation = async (title: string) => {
    if (!title?.trim()) {
      return;
    }

    const course = (await createCourse({
      title
    })) as APIActionResponse<Course>;

    if (!displayErrors(course)) {
      setShowCourseModal(false);

      sendGTMEvent(GTM_EVENTS.PRODUCT_CREATED, {
        product_type: "course",
        product_title: title,
        product_id: course?.data.data.id
      });

      await skipOnboardingMutation({
        onboarding_status: "completed"
      });

      dispatch(fetchPermissions()).finally(() => {
        setCookie("is_onboarding", true);
        router.replace(`/courses/${course?.data.data.id}/chapters?onboarding=course-edit`).finally(async () => {
          await refetchAuth();
        });
      });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <div className="mb-1 text-xl font-semibold">{t("onboard.build.title")}</div>
        <div className="text-sm text-gray-800">{t("onboard.build.subtitle")}</div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div
          role="button"
          onClick={async () => {
            await skipOnboardingMutation({
              onboarding_status: "completed"
            }).then(() => {
              router.replace(process.env.NEXT_PUBLIC_BUILDER_URL as string);
            });
          }}
          className="flex items-start gap-4 rounded-2xl bg-gray-100 p-6 "
        >
          <div className="rounded-lg bg-white p-4">
            <Icon
              className="!h-8 !w-8"
              children={<UserStoryIcon className="text-primary " />}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xl font-semibold text-gray-900">{t("onboard.build.website_title")}</div>
            <div className="text-base font-normal text-gray-700">{t("onboard.build.website_subtitle")}</div>
          </div>
        </div>
        <div
          role="button"
          onClick={() => onProductOrCoaching("product")}
          className="flex cursor-pointer items-start gap-4 rounded-2xl bg-gray-100 p-6"
        >
          <div className="rounded-lg bg-white p-4">
            <Icon
              className="!h-8 !w-8"
              children={<FileFavouriteIcon className="text-primary " />}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xl font-semibold text-gray-900">{t("onboard.build.product_title")}</div>
            <div className="text-base font-normal text-gray-700">{t("onboard.build.product_subtitle")}</div>
          </div>
        </div>
        <div
          role="button"
          onClick={() => {
            setShowCourseModal(true);
          }}
          className="flex cursor-pointer items-start gap-4 rounded-2xl bg-gray-100 p-6"
        >
          <div className="rounded-lg bg-white p-4">
            <Icon
              className="!h-8 !w-8"
              children={<PlayListFavourite02Icon className="text-primary " />}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xl font-semibold text-gray-900">{t("onboard.build.course_title")}</div>
            <div className="text-base font-normal text-gray-700">{t("onboard.build.course_subtitle")}</div>
          </div>
        </div>
        <div
          role="button"
          onClick={() => onProductOrCoaching("coaching")}
          className="flex items-start gap-4 rounded-2xl bg-gray-100 p-6"
        >
          <div className="rounded-lg bg-white p-4">
            <Icon
              className="!h-8 !w-8"
              children={<UserSwitchIcon className="text-primary " />}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xl font-semibold text-gray-900">{t("onboard.build.coaching_title")}</div>
            <div className="text-base font-normal text-gray-700">{t("onboard.build.coaching_subtitle")}</div>
          </div>
        </div>
      </div>

      <CreateNewModal
        title={t("courses.add_new_course")}
        type="course"
        inputLabel={t("courses.course_title")}
        inputPlaceholder={t("courses.course_title_input_placeholder")}
        createAction={handleCourseCreation}
        submitButtonText={t("add_new")}
        open={showCourseModal}
        onDismiss={() => {
          setShowCourseModal(false);
        }}
      />
      <div className="flex w-full justify-end border-t border-gray-400 pt-4">
        <SkipButton />
      </div>
    </div>
  );
};

export default BuildProductStep;
