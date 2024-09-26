enum ActionType {
  LoadContent = "loadContent",
  ContentReady = "contentReady",
}

export interface RecieveMsgInterface<T> {
  type: `${ActionType}`;
  data?: T;
}

export default ActionType;
