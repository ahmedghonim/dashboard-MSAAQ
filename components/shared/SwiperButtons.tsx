import { useEffect, useState } from "react";

import { useSwiper } from "swiper/react";

import { classNames } from "@/utils";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

import { Button, Icon } from "@msaaqcom/abjad";

interface Props {
  leftClassName?: string;
  rightClassName?: string;
  color?: "gray" | "primary" | "secondary" | "warning" | "success" | "danger" | "info" | "gradient";
}

const SwiperButtons = ({ color, leftClassName, rightClassName }: Props) => {
  const swiper = useSwiper();

  const [allowSlideNext, setAllowSlideNext] = useState(true);
  const [allowSlidePrev, setAllowSlidePrev] = useState(false);

  useEffect(() => {
    swiper.on("slideChange", () => {
      if (swiper.isBeginning) {
        setAllowSlidePrev(false);
      } else {
        setAllowSlidePrev(true);
      }
      if (swiper.isEnd) {
        setAllowSlideNext(false);
      } else {
        setAllowSlideNext(true);
      }
    });
  }, [swiper]);

  return (
    <>
      {allowSlideNext && (
        <Button
          rounded
          variant={"info"}
          className={classNames("absolute left-0 top-1/2 z-10 -translate-y-1/2", leftClassName)}
          icon={
            <Icon>
              <ChevronLeftIcon />
            </Icon>
          }
          onClick={() => {
            swiper.slideNext();
          }}
        />
      )}
      {allowSlidePrev && (
        <Button
          rounded
          variant={"info"}
          className={classNames("absolute right-0 top-1/2 z-10 -translate-y-1/2", rightClassName)}
          icon={
            <Icon>
              <ChevronRightIcon />
            </Icon>
          }
          onClick={() => {
            swiper.slidePrev();
          }}
        />
      )}
    </>
  );
};

export default SwiperButtons;
