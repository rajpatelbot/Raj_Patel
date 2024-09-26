import React, { Dispatch, SetStateAction, useRef } from "react";
import { IChatWithAI } from "./types";
import generateLogo from "@/assets/generate.svg";
import insertLogo from "@/assets/insert.svg";
import regenerateLogo from "@/assets/regenerate.svg";
import { useClickOutside } from "../hooks/useClickOutside";

type Props = {
  setPromptOpen: Dispatch<SetStateAction<boolean>>;
};

const Prompt = ({ setPromptOpen }: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const [propmtVal, setPropmtVal] = React.useState<string>("");
  const [chatWithAi, setChatWithAi] = React.useState<IChatWithAI[]>([]);

  useClickOutside(modalRef, () => setPromptOpen(false));

  const handleGenerateClick = () => {
    if (propmtVal) {
      setChatWithAi((prev) => [
        ...prev,
        {
          sentBy: "user",
          message: propmtVal,
          timestamp: Date.now(),
        },
      ]);

      setPropmtVal("");

      // This will auto genrate the response for the user prompt. SetTimeout is used to delay the response for ms.
      setTimeout(() => {
        setChatWithAi((prev) => [
          ...prev,
          {
            sentBy: "ai",
            message:
              "Thank you for the opportunity! If you have any more questions or if there's anything else I can help you with, feel free to ask.",
            timestamp: Date.now(),
          },
        ]);
      }, 200);
    }
  };

  // Show the insert button only if the last chat was sent by the AI
  const isAiSentResponse: boolean = useMemo(() => {
    if (chatWithAi.length > 0) {
      const lastChat = chatWithAi[chatWithAi.length - 1];
      if (lastChat.sentBy === "ai") {
        return true;
      }
    }
    return false;
  }, [chatWithAi]);

  const handleInsertClick = () => {
    const linkedinTextArea = document.getElementsByClassName("msg-form__contenteditable");
    if (linkedinTextArea.length > 0) {
      const pTag = linkedinTextArea[0].querySelector("p");
      if (pTag) {
        const lastChat = chatWithAi[chatWithAi.length - 1];
        pTag.innerHTML = lastChat.message;
        // Manually triggered input event to simulate user interaction.
        const event = new Event("input", { bubbles: true, cancelable: true });
        linkedinTextArea[0].dispatchEvent(event);
      }
    }
    setPromptOpen(false);
  };

  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-[#00000042]">
      <div ref={modalRef} className="w-[570px] rounded-[10px] bg-[#f9fafb] p-[20px] shadow-md">
        <div className="flex flex-col max-h-[500px] overflow-y-auto">
          {chatWithAi.map((chat) => (
            <div
              key={chat.timestamp}
              className={`flex flex-col ${chat.sentBy === "user" ? "items-end" : "items-start"}`}
            >
              <p
                className={`text-[#181818] ${
                  chat.sentBy === "user"
                    ? "text-left text-[#666d80] bg-[#DFE1E7] py-[8px] px-[12px] w-[400px] max-w-[500px] rounded-[8px] mb-[20px]"
                    : "text-left text-[#666d80] bg-[#DBEAFE] py-[8px] px-[12px] w-[400px] max-w-[500px] rounded-[8px] mb-[20px]"
                }`}
              >
                {chat.message}
              </p>
            </div>
          ))}
        </div>

        <input
          type="text"
          value={propmtVal}
          placeholder="Your prompt"
          onChange={(e) => setPropmtVal(e.target.value)}
          className="w-full rounded-lg border border-[#c0c6cf] px-3 py-2 focus:outline-none"
        />
        <div className="w-full flex justify-end">
          <div className="flex items-center justify-between">
            {isAiSentResponse ? (
              <button
                type="button"
                className="mt-[20px] bg-transparent py-2 px-5 text-[#666D80] border-2 mr-[15px] border-[#666D80] rounded-[5px] flex items-center gap-[7px]"
                onClick={handleInsertClick}
              >
                <img src={insertLogo} className="w-[16px] h-[16px]" alt="generate" />
                Insert
              </button>
            ) : null}

            {!isAiSentResponse ? (
              <button
                type="button"
                className="mt-[20px] bg-[#3b82f6] py-2 px-5 text-white border-2 border-[#3b82f6] rounded-[5px] flex items-center gap-[7px]"
                onClick={handleGenerateClick}
              >
                <img src={generateLogo} className="w-[16px] h-[16px]" alt="generate" />
                Generate
              </button>
            ) : (
              <button
                type="button"
                className="mt-[20px] bg-[#3b82f6] py-2 px-5 text-white border-2 border-[#3b82f6] rounded-[5px] flex items-center gap-[7px]"
                onClick={() => {
                  return;
                }}
              >
                <img src={regenerateLogo} className="w-[16px] h-[16px]" alt="generate" />
                Regenerate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prompt;
