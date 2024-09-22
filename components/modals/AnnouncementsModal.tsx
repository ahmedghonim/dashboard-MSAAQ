import React, { useEffect, useMemo, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { useTranslation } from "next-i18next";

import dayjs from "@/lib/dayjs";
import { Announcement } from "@/types/models/announcement";
import { classNames } from "@/utils";

import { EyeIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

import { Button, Icon, Modal, ModalProps, Typography } from "@msaaqcom/abjad";

interface AnnouncementStep {
  image: {
    url: string;
  };
  title: string;
  created_at: string;
  subtitle: string;
  action_url: string;
  action_text: string;
}

const Slider = ({
  steps,
  currentIndex,
  month,
  size,
  badge
}: {
  steps: AnnouncementStep[];
  badge: string;
  month: string;
  currentIndex: number;
  size: "large" | "small";
}) => {
  const { t } = useTranslation();
  const currentStep = steps[currentIndex];

  return (
    <div>
      {size === "large" && (
        <div className="flex gap-12">
          <div className="flex w-1/2 flex-col items-center justify-center">
            <div className="h-auto max-h-[320px] min-h-[320px] w-full min-w-[320px] max-w-[320px]">
              <Image
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: "100%", height: "auto" }}
                priority
                src={currentStep.image.url}
                alt={currentStep.title}
                className="rounded-lg"
              />
            </div>
            <div
              className="mt-3 flex gap-1"
              dir="ltr"
            >
              {steps.length > 1 &&
                steps.map((step, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full ${currentIndex === i ? "w-4 bg-primary" : "w-2 bg-primary-100"}`}
                  ></div>
                ))}
            </div>
          </div>
          <div className="mt-4 w-1/2">
            <div className="mb-2 flex gap-4">
              <Typography.Paragraph
                size="md"
                className="font-semibold text-primary"
                children={badge}
              />
              <Typography.Paragraph
                size="md"
                className="text-gray-700"
                children={dayjs(month).format("MMMM YYYY")}
              />
            </div>
            <Typography.Paragraph
              className="mb-3 text-2xl font-semibold"
              children={currentStep.title}
            />
            <Typography.Paragraph
              size="md"
              className="mb-6 text-gray-800"
              children={currentStep.subtitle}
            />
            {currentStep.action_url && currentStep.action_text && (
              <Button
                as={Link}
                variant={"primary"}
                href={currentStep.action_url}
                target="_blank"
              >
                {currentStep.action_text}
              </Button>
            )}
          </div>
        </div>
      )}
      {size === "small" && (
        <div>
          <div className="flex h-[235px] items-center justify-center bg-primary-50 py-4">
            <div className="flex h-auto max-h-[220px] min-h-[220px] w-full min-w-[290px] max-w-[290px] items-center justify-center overflow-hidden">
              <Image
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: "100%", height: "auto" }}
                priority
                src={currentStep.image.url}
                alt={currentStep.title}
              />
            </div>
          </div>
          <div className="px-4 pt-6">
            <div className="mb-2 flex gap-4">
              <Typography.Paragraph
                size="md"
                className="font-semibold text-primary"
                children={badge}
              />
              <Typography.Paragraph
                size="md"
                className="text-gray-700"
                children={dayjs(month).format("MMMM YYYY")}
              />
            </div>
            <Typography.Paragraph
              className="mb-3 text-2xl font-semibold"
              children={currentStep.title}
            />
            <Typography.Paragraph
              size="md"
              className=" text-gray-800"
              children={currentStep.subtitle}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface Props extends ModalProps {
  announcements: Announcement[];
  onUpdate: (announcementId: string) => void;
  onMarkAsRead: (announcementId: string) => void;
}

const AnnouncementsModal: React.FC<Props> = ({ open, announcements, onMarkAsRead, onUpdate, ...props }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    setShow(open ?? false);
  }, [open]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const markAsRead = (announcement_id: string) => {
    props.onDismiss?.();
    onMarkAsRead(announcement_id);
    setCurrentIndex(0);
  };

  const nextSlide = (stepsLength: number) => {
    setCurrentIndex((prevIndex) => (prevIndex === stepsLength - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = (stepsLength: number) => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? stepsLength - 1 : prevIndex - 1));
  };

  const activeAnnouncement = useMemo<Announcement | undefined>(() => announcements[0], [announcements]);

  const isLargeSlider = activeAnnouncement && activeAnnouncement.size == "large";

  return (
    <div>
      {show && announcements.length > 0 && activeAnnouncement && (
        <Modal
          open={show}
          size={isLargeSlider ? "xl" : "lg"}
          className={classNames(
            isLargeSlider ? "min-w-[962px] rounded-3xl" : "min-h-[500px] justify-between rounded-none"
          )}
          onDismiss={() => {
            props.onDismiss?.();
            onUpdate(activeAnnouncement.id);
            setCurrentIndex(0);
          }}
        >
          {isLargeSlider && (
            <Modal.Header className="!border-0">
              <div className="mb-6"></div>
            </Modal.Header>
          )}

          <Modal.Content className={classNames(isLargeSlider ? "" : "!px-0 !pt-0")}>
            <Modal.Body>
              <Slider
                size={activeAnnouncement.size}
                badge={activeAnnouncement.badge}
                month={activeAnnouncement.month}
                steps={activeAnnouncement.steps}
                currentIndex={currentIndex}
              />
            </Modal.Body>
          </Modal.Content>
          <Modal.Footer>
            {isLargeSlider ? (
              <div className="flex w-full justify-end">
                {activeAnnouncement.steps.length > 1 && (
                  <div className="ml-auto flex items-center justify-center gap-2">
                    <Button
                      onClick={() => nextSlide(activeAnnouncement.steps.length)}
                      disabled={currentIndex === activeAnnouncement.steps.length - 1}
                      icon={
                        <Icon>
                          <ChevronRightIcon />
                        </Icon>
                      }
                    />
                    <div className="px-28">
                      <Typography.Paragraph
                        children={
                          <>
                            <span className="text-gray-700">{activeAnnouncement.steps.length} </span>
                            <span className="text-primary">/ {currentIndex + 1}</span>
                          </>
                        }
                      />
                    </div>
                    <Button
                      onClick={() => prevSlide(activeAnnouncement.steps.length)}
                      disabled={currentIndex === 0}
                      icon={
                        <Icon>
                          <ChevronLeftIcon />
                        </Icon>
                      }
                    />
                  </div>
                )}
                <Button
                  variant="default"
                  onClick={() => markAsRead(activeAnnouncement.id)}
                  children={t("announcements.mark_all_as_read")}
                  icon={
                    <Icon>
                      <EyeIcon />
                    </Icon>
                  }
                />
              </div>
            ) : (
              <div className="flex w-full justify-between">
                {activeAnnouncement.steps[0].action_url && activeAnnouncement.steps[0].action_text && (
                  <Button
                    as={Link}
                    variant="primary"
                    href={activeAnnouncement.steps[0].action_url}
                    children={activeAnnouncement.steps[0].action_text}
                    target="_blank"
                  />
                )}
                <Button
                  variant="default"
                  onClick={() =>
                    currentIndex === activeAnnouncement.steps.length - 1
                      ? markAsRead(activeAnnouncement.id)
                      : nextSlide(activeAnnouncement.steps.length)
                  }
                  children={
                    currentIndex === activeAnnouncement.steps.length - 1
                      ? t("announcements.done")
                      : t("announcements.next", {
                          steps: `${activeAnnouncement.steps.length}/${currentIndex + 1}`
                        })
                  }
                />
              </div>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default AnnouncementsModal;
