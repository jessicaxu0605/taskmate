import { useState } from "react";
import CreateTaskOverlay from "./CreateTaskOverlay";

type CreateTaskButtonProps = {
  refreshOnCreation: () => void;
};

export default function CreateTaskButton({
  refreshOnCreation,
}: CreateTaskButtonProps) {
  const [createTaskOverlayOpen, setCreateTaskOverlayOpen] =
    useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <>
      {createTaskOverlayOpen ? (
        <CreateTaskOverlay
          closeOverlay={() => {
            refreshOnCreation();
            setCreateTaskOverlayOpen(false);
          }}
        />
      ) : null}
      <button
        onClick={() => setCreateTaskOverlayOpen(true)}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="bg-violet-700 rounded-full p-3 m-3 flex justify-center items-center overflow-hidden"
        style={{
          width: isExpanded ? "12rem" : "3rem",
          height: "3rem",
          transition: "width 0.5s",
        }}
      >
        {isExpanded ? (
          <h2 className="text-white font-bold text-nowrap">CREATE NEW TASK</h2>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            height="80%"
            width="80%"
          >
            {/* <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--> */}
            <path
              fill="white"
              d="M416 208H272V64c0-17.7-14.3-32-32-32h-32c-17.7 0-32 14.3-32 32v144H32c-17.7 0-32 14.3-32 32v32c0 17.7 14.3 32 32 32h144v144c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V304h144c17.7 0 32-14.3 32-32v-32c0-17.7-14.3-32-32-32z"
            />
          </svg>
        )}
      </button>
    </>
  );
}
