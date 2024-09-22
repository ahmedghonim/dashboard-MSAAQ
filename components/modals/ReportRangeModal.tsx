import React, { FC, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import { DateRange } from "react-day-picker";

import { RangeDatePicker } from "@/components";
import { classNames } from "@/utils";

import { Button, Form, Modal, ModalProps } from "@msaaqcom/abjad";

interface Props extends ModalProps {
  onSubmit: (range: DateRange) => void;
  defaultValue?: DateRange;
  ranges?: {
    [key: string]: {
      from: Date;
      to: Date;
    };
  };
}

const ReportRangeModal: FC<Props> = ({ onSubmit, defaultValue, ranges, open, ...props }) => {
  const { t } = useTranslation();

  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    setShow(open ?? false);
  }, [open]);

  const [filterInterval, setInterval] = useState<string | undefined>(undefined);

  const [selectedRange, setSelectedRange] = useState<DateRange>();

  return (
    <Modal
      className="max-w-[796px]"
      open={show}
      {...props}
    >
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ from: selectedRange?.from, to: selectedRange?.to });
        }}
      >
        <Modal.Header>
          <Modal.HeaderTitle>
            <div className="mb-5" />
          </Modal.HeaderTitle>
        </Modal.Header>
        <Modal.Body>
          <Modal.Content>
            <div className="flex">
              {ranges && (
                <>
                  <div className="flex flex-col justify-center space-y-2">
                    {Object.keys(ranges ?? {}).map((interval, index) => (
                      <React.Fragment key={`${interval}-${index}`}>
                        <div
                          role="button"
                          className={classNames(
                            "cursor-pointer rounded px-2 py-1 text-start hover:bg-primary-50",
                            filterInterval === interval && "bg-primary-50"
                          )}
                          onClick={() => {
                            setInterval(interval);
                            setSelectedRange({ from: ranges?.[interval]?.from, to: ranges?.[interval]?.to });
                          }}
                          children={interval}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="mx-4 border-l border-gray" />
                </>
              )}
              <div className="range-date-picker flex">
                <RangeDatePicker
                  numberOfMonths={2}
                  onChange={setSelectedRange}
                  value={
                    selectedRange
                      ? { from: selectedRange?.from, to: selectedRange?.to }
                      : { from: defaultValue?.from, to: defaultValue?.to }
                  }
                />
              </div>
            </div>
          </Modal.Content>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="lg"
            className="ml-2"
            children={t("confirm")}
            type="submit"
          />
          <Button
            variant="dismiss"
            size="lg"
            children={t("undo")}
            onClick={() => {
              props.onDismiss?.();
            }}
          />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ReportRangeModal;
