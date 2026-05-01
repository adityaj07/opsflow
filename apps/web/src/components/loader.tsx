import { Loading03Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";

export function Loader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Icon icon={Loading03Icon} className="animate-spin" />
    </div>
  );
}
