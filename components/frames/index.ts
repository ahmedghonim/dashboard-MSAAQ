import { FramesInitProps } from "@/components/frames/types";

import CardFrame from "./CardFrame";
import CardNumber from "./CardNumber";
import Cvv from "./Cvv";
import ExpiryDate from "./ExpiryDate";
import Frames from "./Frames";
import SchemeChoice from "./SchemeChoice";

Frames.init = (config?: FramesInitProps) => {
  if (window?.Frames) {
    // remove event handlers to avoid event duplication
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
    config ? window.Frames.init(config) : window.Frames.init();
  }
};

Frames.isCardValid = () => {
  if (window?.Frames) {
    return window.Frames.isCardValid();
  }

  return false;
};

Frames.submitCard = () => {
  if (window?.Frames) {
    return window.Frames.submitCard();
  }

  return Promise.reject("Frames isn't initialized yet or doesn't exist");
};

Frames.addEventHandler = (event, eventHandler) => {
  if (window?.Frames) {
    window.Frames.addEventHandler(event, eventHandler);
  }
};

Frames.removeEventHandler = (event, eventHandler) => {
  if (window?.Frames) {
    return window.Frames.removeEventHandler(event, eventHandler);
  }

  return false;
};

Frames.removeAllEventHandlers = (event) => {
  if (window?.Frames) {
    return window.Frames.removeAllEventHandlers(event);
  }

  return false;
};

Frames.enableSubmitForm = () => {
  if (window?.Frames) {
    return window.Frames.enableSubmitForm();
  }
};

Frames.CardNumber = CardNumber;
Frames.ExpiryDate = ExpiryDate;
Frames.Cvv = Cvv;
Frames.Card = CardFrame;
Frames.SchemeChoice = SchemeChoice;

export { Frames };
