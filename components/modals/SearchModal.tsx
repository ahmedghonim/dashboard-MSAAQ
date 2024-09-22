import React, { FC } from "react";

import { Modal, ModalProps } from "@msaaqcom/abjad";

import Search from "../select/Search";

interface SearchModalProps extends ModalProps {
  open: boolean;
  onDismiss: () => void;
}

const SearchModal: FC<SearchModalProps> = ({ open = false, onDismiss }: SearchModalProps) => {
  return (
    <Modal
      size="sm"
      open={open}
      onDismiss={onDismiss}
      className="w-10/12"
    >
      <Modal.Body>
        <Modal.Content>
          <Search />
        </Modal.Content>
      </Modal.Body>
    </Modal>
  );
};
export default SearchModal;
