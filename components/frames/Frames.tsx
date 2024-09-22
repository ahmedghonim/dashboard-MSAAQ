import { FC, MemoExoticComponent, memo, useEffect } from "react";

import { CDN } from "@/components/frames/config";
import { FramesAppendedProps, FramesProps } from "@/components/frames/types";

import CardFrame from "./CardFrame";
import CardNumber from "./CardNumber";
import Cvv from "./Cvv";
import ExpiryDate from "./ExpiryDate";
import SchemeChoice from "./SchemeChoice";

declare global {
  interface Window {
    Frames: FramesAppendedProps;
  }
}
const loadScript = () => {
  if (typeof window === "undefined") return;

  return new Promise((resolve, reject) => {
    const scriptTag = document.createElement("script");

    scriptTag.src = CDN;
    scriptTag.onload = (ev) => resolve(ev);
    scriptTag.onerror = (err) => reject(err);
    document.head.appendChild(scriptTag);
  });
};

const Frames = memo<FramesProps>(
  function Frames(props) {
    const initializeFrames = () => {
      let config = {
        publicKey: props.config.publicKey,
        debug: props.config.debug || false,
        style: props.config.style,
        acceptedPaymentMethods: props.config.acceptedPaymentMethods,
        cardholder: props.config.cardholder,
        localization: props.config.localization,
        modes: props.config.modes,
        schemeChoice: props.config.schemeChoice,
        cardNumber: props.config.cardNumber,
        expiryDate: props.config.expiryDate,
        cvv: props.config.cvv,
        ready: props.ready,
        frameActivated: props.frameActivated,
        frameFocus: props.frameFocus,
        frameBlur: props.frameBlur,
        frameValidationChanged: props.frameValidationChanged,
        paymentMethodChanged: props.paymentMethodChanged,
        cardValidationChanged: props.cardValidationChanged,
        cardSubmitted: props.cardSubmitted,
        cardTokenized: props.cardTokenized,
        cardTokenizationFailed: props.cardTokenizationFailed,
        cardBinChanged: props.cardBinChanged
      };

      // Frames throws an error if the cardholder object is mentioned but not defined
      // To avoid this we remove the property completely if not set as a prop.
      if (!props.config.cardholder) {
        delete config.cardholder;
      }

      // Frames throws an error if the schemeChoice object is mentioned but not defined
      // To avoid this we remove the property completely if not set as a prop.
      if (!props.config.schemeChoice) {
        delete config.schemeChoice;
      }

      // Frames throws an error if the cardNumber object is mentioned but not defined
      // To avoid this we remove the property completely if not set as a prop.
      if (!props.config.cardNumber) {
        delete config.cardNumber;
      }

      // Frames throws an error if the expiryDate object is mentioned but not defined
      // To avoid this we remove the property completely if not set as a prop.
      if (!props.config.expiryDate) {
        delete config.expiryDate;
      }

      // Frames throws an error if the cvv object is mentioned but not defined
      // To avoid this we remove the property completely if not set as a prop.
      if (!props.config.cvv) {
        delete config.cvv;
      }

      // Frames throws an error if the modes object is mentioned but not defined
      // To avoid this we remove the property completely if not set as a prop.
      if (!props.config.modes) {
        delete config.modes;
      }

      // Frames throws an error if the localization object is mentioned but not defined
      // To avoid this we remove the property completely if not set as a prop.
      if (!props.config.localization) {
        delete config.localization;
      }

      try {
        if (window.Frames) {
          window.Frames.init(config);
        }
      } catch (e) {
        throw e;
      }
    };
    const loadFrames = async () => {
      try {
        await loadScript();
        initializeFrames();
      } catch (e) {
        throw e;
      }
    };

    const cleanupFrames = () => {
      if (window.Frames) {
        window.Frames.removeAllEventHandlers(window.Frames.Events.CARD_SUBMITTED);
        window.Frames.removeAllEventHandlers(window.Frames.Events.CARD_TOKENIZATION_FAILED);
        window.Frames.removeAllEventHandlers(window.Frames.Events.CARD_TOKENIZED);
        window.Frames.removeAllEventHandlers(window.Frames.Events.CARD_VALIDATION_CHANGED);
        window.Frames.removeAllEventHandlers(window.Frames.Events.FRAME_ACTIVATED);
        window.Frames.removeAllEventHandlers(window.Frames.Events.FRAME_BLUR);
        window.Frames.removeAllEventHandlers(window.Frames.Events.FRAME_FOCUS);
        window.Frames.removeAllEventHandlers(window.Frames.Events.FRAME_VALIDATION_CHANGED);
        window.Frames.removeAllEventHandlers(window.Frames.Events.PAYMENT_METHOD_CHANGED);
        window.Frames.removeAllEventHandlers(window.Frames.Events.READY);
      }
    };

    useEffect(() => {
      loadFrames();

      return () => {
        cleanupFrames();
      };
    }, []);

    useEffect(() => {
      if (!window?.Frames) return;

      if (props.config.cardholder && props.config.cardholder.name) {
        window.Frames.cardholder.name = props.config.cardholder.name;
      }
      if (props.config.cardholder && props.config.cardholder.billingAddress) {
        window.Frames.cardholder.billingAddress = props.config.cardholder.billingAddress;
      }
      if (props.config.cardholder && props.config.cardholder.phone) {
        window.Frames.cardholder.phone = props.config.cardholder.phone;
      }
    }, [props.config]);

    return <>{props.children}</>;
  },
  () => true
);

type FramesComponent<P = {}> = MemoExoticComponent<FC<P>> &
  FramesAppendedProps & {
    Card: typeof CardFrame;
    CardNumber: typeof CardNumber;
    Cvv: typeof Cvv;
    ExpiryDate: typeof ExpiryDate;
    SchemeChoice: typeof SchemeChoice;
  };

export default Frames as FramesComponent<FramesProps>;
