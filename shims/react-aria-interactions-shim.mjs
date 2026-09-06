// Workaround for the react-aria duplicate-context bug. See
// next.config.ts for the resolveAlias that routes
// `@react-aria/interactions` here.
//
// Why: the `@react-aria/interactions` subpackage and the `react-aria`
// umbrella each ship a bundled copy of PressResponderContext and
// FocusableContext. When Keystatic's button (which uses the umbrella
// via @react-aria/button → react-aria@3.48.0) renders a PressResponder
// and its toolbar (which imports `@react-aria/interactions` directly)
// reads usePress / useHover, the two see different React contexts. The
// responder never finds a pressable child → "PressResponder was
// rendered without a pressable child" → toolbar buttons render but do
// not fire.
//
// This shim re-exports the same surface that `@react-aria/interactions`
// exposes, but sources every binding from the `react-aria` umbrella.
// Anywhere that imports `@react-aria/interactions` now shares the
// umbrella's contexts, so PressResponder + child consumers agree.
//
// Drop this shim + the alias in next.config.ts once Keystatic publishes
// a release that uses the `react-aria` monopackage directly.

// Most names live on the umbrella's top-level entry.
export * from "react-aria";

// Names that the umbrella keeps in its private subpath exports.
// These are the consumers of the *contexts* that this whole workaround
// exists to dedupe — pulling them from the umbrella's private paths
// guarantees a single context instance shared with @react-aria/button.
export {
  PressResponder,
  ClearPressResponder,
} from "react-aria/private/interactions/PressResponder";

export {
  FocusableContext,
  FocusableProvider,
} from "react-aria/private/interactions/useFocusable";

export {
  addWindowFocusTracking,
  getInteractionModality,
  getPointerType,
  isFocusVisible,
  setInteractionModality,
  useFocusVisibleListener,
  useInteractionModality,
} from "react-aria/private/interactions/useFocusVisible";

export { useScrollWheel } from "react-aria/private/interactions/useScrollWheel";

export { focusSafely } from "react-aria/private/interactions/focusSafely";
