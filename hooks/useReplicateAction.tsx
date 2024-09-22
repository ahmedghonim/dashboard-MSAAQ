import { useResponseToastHandler } from "@/hooks/useResponseToastHandler";
import { APIActionResponse } from "@/types";

type ReturnType = [(id: string | number, callback?: () => void) => void];

type HookProps = {
  mutation: any;
};

export const useReplicateAction = ({ mutation }: HookProps): ReturnType => {
  const { display } = useResponseToastHandler({});
  const [replicateMutation] = mutation();

  const replicate = async (id: string | number, callback?: () => void) => {
    const response = (await replicateMutation(id)) as APIActionResponse<any>;

    display(response);

    if (response.error) {
      return;
    }

    callback?.();
  };

  return [replicate];
};
