import { useEffect, useState } from "react";
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

  // Use MutationObserver to detect when LinkedIn input is added to the DOM.
  useEffect(() => {
    if (isContentLoaded) {
      const observer = new MutationObserver(() => {
        const linkedinTextArea = document.getElementsByClassName("msg-form__contenteditable");

        if (linkedinTextArea.length > 0) {
          const contentEditableElement = linkedinTextArea[0] as HTMLElement;
          const parentElem = contentEditableElement.parentElement!;

          setLinkedInInput(contentEditableElement);
          setParentElem(parentElem);
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
      const handleBlur = (e: FocusEvent) => {
        // To make sure that the magic icon is not removed when the user clicks on the magic icon.
        if (e.relatedTarget && (e.relatedTarget as HTMLElement).classList.contains("magic-stick-icon")) {
          return;
        }
        setIsFocused(false);
      };

      contentEditableElement.addEventListener("focus", handleFocus);
      contentEditableElement.addEventListener("blur", handleBlur);

      return () => {
        contentEditableElement.removeEventListener("focus", handleFocus);
        contentEditableElement.removeEventListener("blur", handleBlur);
      };
    }
  }, [linkedInInput]);

  const handleMagicIconClick = () => {
    setPromptOpen(true);
    setIsFocused(false);
  };

  if (!isContentLoaded || !parentElem) {
    return null;
  }

  return (
    <>
      {/* Used React createPortal to insert the magic icon in the linkdin element, so positioning is correct */}
      {parentElem && isFocused
        ? createPortal(
            <div className="absolute z-50" style={{ bottom: "0px", right: "5px" }}>
              <div className="w-full h-full">
                <img
                  src={magicSvg}
                  alt="magic-stick"
                  onClick={handleMagicIconClick}
                  className="cursor-pointer w-6 h-6 magic-stick-icon"
                  tabIndex={0}
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
