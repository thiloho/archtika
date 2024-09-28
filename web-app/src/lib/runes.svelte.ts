let sendingState = $state(false);
let previewContentState = $state("");
let textareaScrollTopState = $state(0);

export const sending = {
  get value() {
    return sendingState;
  },
  set value(val) {
    sendingState = val;
  }
};

export const previewContent = {
  get value() {
    return previewContentState;
  },
  set value(val) {
    previewContentState = val;
  }
};

export const textareaScrollTop = {
  get value() {
    return textareaScrollTopState;
  },
  set value(val) {
    textareaScrollTopState = val;
  }
};
