import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Prompt from "./components/Prompt";
import ActionType, { RecieveMsgInterface } from "../types";
import magicSvg from "@/assets/magic.svg";

export default () => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [promptOpen, setPromptOpen] = useState<boolean>(false);
  const [isContentLoaded, setIsContentLoaded] = useState<boolean>(false);

  const [parentElem, setParentElem] = useState<HTMLElement | null>(null);
  const [linkedInInput, setLinkedInInput] = useState<Element | null>(null);

  const domLoaded = () => {
    console.log("Dom loaded");
    browser.runtime.sendMessage({
      type: ActionType.ContentReady,
    });
  };

  useEffect(() => {
    if (document.readyState === "complete") {
      domLoaded();
    } else {
      window.addEventListener("load", domLoaded);
    }

    // Listen to the message from the background script
    browser.runtime.onMessage.addListener((message: RecieveMsgInterface<boolean>) => {
      if (message.type === ActionType.LoadContent && message.data) {
        setIsContentLoaded(message.data);
      }
    });

    return () => {
      window.removeEventListener("load", domLoaded);
    };
  }, []);

  // Use MutationObserver to detect when LinkedIn input is added to the DOM
  useEffect(() => {
    if (isContentLoaded) {
      const observer = new MutationObserver(() => {
        const linkedinTextArea = document.getElementsByClassName("msg-form__contenteditable");

        if (linkedinTextArea.length > 0) {
          const contentEditableElement = linkedinTextArea[0] as HTMLElement;
          const parentElem = contentEditableElement.parentElement!;

          setLinkedInInput(contentEditableElement);
          setParentElem(parentElem);
          observer.disconnect();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
      };
    }
  }, [isContentLoaded]);

  // Handle focus and blur events on LinkedIn input
  useEffect(() => {
    if (linkedInInput) {
      const contentEditableElement = linkedInInput as HTMLElement;

      const handleFocus = () => setIsFocused(true);
      const handleBlur = () => setIsFocused(false);

      contentEditableElement.addEventListener("focus", handleFocus);
      contentEditableElement.addEventListener("blur", handleBlur);

      return () => {
        contentEditableElement.removeEventListener("focus", handleFocus);
        contentEditableElement.removeEventListener("blur", handleBlur);
      };
    }
  }, [linkedInInput]);

  if (!isContentLoaded || !parentElem) {
    return null;
  }

  return (
    <>
      {parentElem && isFocused
        ? createPortal(
            <div className="absolute z-50" style={{ bottom: "0px", right: "5px" }}>
              <div className="w-full h-full">
                <img
                  src={magicSvg}
                  alt="magic-stick"
                  onClick={() => {
                    setPromptOpen(true);
                  }}
                  className="cursor-pointer w-6 h-6"
                />
              </div>
            </div>,
            parentElem,
            "magic-stick"
          )
        : null}

      {promptOpen ? <Prompt setPromptOpen={setPromptOpen} /> : null}
    </>
  );
};
