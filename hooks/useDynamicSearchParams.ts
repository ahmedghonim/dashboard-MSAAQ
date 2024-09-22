import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { objectToQueryString } from "@/utils";

export const useDynamicSearchParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const set = (query: { [key: string]: any }) => {
    router.push(`${pathname}?${objectToQueryString(query)}`);
  };

  const clear = () => {
    router.push(`${pathname}`);
  };

  return {
    ...searchParams,
    set,
    clear
  };
};
