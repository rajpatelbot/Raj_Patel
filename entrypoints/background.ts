import ActionType, { RecieveMsgInterface } from "./types";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message: RecieveMsgInterface<null>) => {
    if (message.type === ActionType.ContentReady) {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        if (tabs[0]) {
          browser.tabs
            .sendMessage(tabs[0].id!, { ping: true })
            .then(() => {
              browser.tabs
                .sendMessage(tabs[0].id!, {
                  type: ActionType.LoadContent,
                  data: true,
                })
                .catch(() => {
                  console.log("Error sending message to content script");
                });
            })
            .catch(() => {
              console.log("Content script is not loaded in the tab");
            });
        }
      });
    }
  });
});
