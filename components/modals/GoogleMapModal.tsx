import { FC, useCallback, useEffect, useState } from "react";

import { APIProvider, Map, MapCameraChangedEvent, MapCameraProps } from "@vis.gl/react-google-maps";
import { i18n, useTranslation } from "next-i18next";

import { MapPinIcon } from "@heroicons/react/24/solid";

import { Button, Icon, Modal, ModalProps } from "@msaaqcom/abjad";

interface GoogleMapModalProps extends ModalProps {
  onSetUrl: (url: string) => void;
}
const GoogleMapModal: FC<GoogleMapModalProps> = ({ open, onDismiss, onSetUrl }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(open);

  useEffect(() => {
    setShow(open ?? false);
  }, [open]);

  const INITIAL_CAMERA = {
    center: { lat: 23.713663851317236, lng: 44.59153765439149 },
    zoom: 4
  };

  const [cameraProps, setCameraProps] = useState<MapCameraProps>(INITIAL_CAMERA);
  const handleCameraChange = useCallback((ev: MapCameraChangedEvent) => setCameraProps(ev.detail), []);

  return (
    <Modal
      open={show}
      onDismiss={onDismiss}
      size="xl"
    >
      <Modal.Header>{t("google_maps.modal_title")}</Modal.Header>
      <Modal.Body>
        <Modal.Content>
          <div className="relative h-[500px]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform">
              <Icon className="mb-4 !h-8 !w-8">
                <MapPinIcon className=" text-danger" />
              </Icon>
            </div>
            <APIProvider
              language={i18n?.language}
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}
            >
              <Map
                {...cameraProps}
                fullscreenControl={false}
                streetViewControl={false}
                gestureHandling={"greedy"}
                onCameraChanged={handleCameraChange}
                id="google-map"
              ></Map>
            </APIProvider>
          </div>
          <Button
            className="mt-4"
            onClick={() => {
              onSetUrl(`https://maps.google.com/?q=${cameraProps.center.lat},${cameraProps.center.lng}`);
              onDismiss?.();
            }}
          >
            {t("google_maps.save")}
          </Button>
        </Modal.Content>
      </Modal.Body>
    </Modal>
  );
};

export default GoogleMapModal;
