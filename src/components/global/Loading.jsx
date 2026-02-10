import { RefreshCw } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg font-medium">Cargando ...</p>
      </div>
    </div>
  );
};

export default Loading;
