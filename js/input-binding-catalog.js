(function () {
  const ACTIONS = {
    axisX: { kind: "axis" },
    axisY: { kind: "axis" },
    dpadUp: { kind: "button" },
    dpadDown: { kind: "button" },
    dpadLeft: { kind: "button" },
    dpadRight: { kind: "button" },
    jump: { kind: "button" },
    roll: { kind: "button" },
    danceBattle: { kind: "button" },
    dance: { kind: "button" },
    r1: { kind: "button" },
    r2: { kind: "button" },
    l1: { kind: "button" },
    l2: { kind: "button" },
    r3: { kind: "button" },
    l3: { kind: "button" },
    start: { kind: "button" },
  };

  const BUTTON_LABELS = {
    ps: {
      0: "Square",
      1: "Circle",
      2: "Cross",
      3: "Triangle",
      4: "L1",
      5: "R1",
      6: "L2",
      7: "R2",
      8: "Share",
      9: "Options",
      10: "L3",
      11: "R3",
      12: "D-Pad Up",
      13: "D-Pad Down",
      14: "D-Pad Left",
      15: "D-Pad Right",
    },
    ps_standard: {
      0: "Cross",
      1: "Circle",
      2: "Square",
      3: "Triangle",
      4: "L1",
      5: "R1",
      6: "L2",
      7: "R2",
      8: "Share",
      9: "Options",
      10: "L3",
      11: "R3",
      12: "D-Pad Up",
      13: "D-Pad Down",
      14: "D-Pad Left",
      15: "D-Pad Right",
    },
    xbox: {
      0: "A",
      1: "B",
      2: "X",
      3: "Y",
      4: "LB",
      5: "RB",
      6: "LT",
      7: "RT",
      8: "View",
      9: "Menu",
      10: "LS",
      11: "RS",
      12: "D-Pad Up",
      13: "D-Pad Down",
      14: "D-Pad Left",
      15: "D-Pad Right",
    },
    switch: {
      0: "B",
      1: "A",
      2: "Y",
      3: "X",
      4: "L",
      5: "R",
      6: "ZL",
      7: "ZR",
      8: "Minus",
      9: "Plus",
      10: "LS",
      11: "RS",
      12: "D-Pad Up",
      13: "D-Pad Down",
      14: "D-Pad Left",
      15: "D-Pad Right",
    },
  };

  BUTTON_LABELS.generic = BUTTON_LABELS.xbox;

  const ACTION_DISPLAY = [
    { id: "jump", label: "Jump (Cross)" },
    { id: "roll", label: "Dodge / Wallslide (Square)" },
    { id: "danceBattle", label: "Grab (Triangle)" },
    { id: "dance", label: "Dance (Circle)" },
    { id: "r1", label: "R1 Ability" },
    { id: "r2", label: "R2 Ability" },
    { id: "l1", label: "L1 Ability" },
    { id: "l2", label: "L2 Ability" },
    { id: "r3", label: "Ultimate (R3)" },
    { id: "l3", label: "L3" },
    { id: "dpadUp", label: "D-Pad Up" },
    { id: "dpadDown", label: "D-Pad Down" },
    { id: "dpadLeft", label: "D-Pad Left" },
    { id: "dpadRight", label: "D-Pad Right" },
    { id: "start", label: "Start / Options" },
    {
      id: "axisX",
      label: "Move Horizontal (Left Stick)",
      editable: false,
    },
    {
      id: "axisY",
      label: "Move Vertical (Left Stick)",
      editable: false,
    },
  ];

  const DEFAULT_BINDINGS = {
    ps: {
      axisX: { type: "axis", index: 0, deadzone: 0.2 },
      axisY: { type: "axis", index: 1, deadzone: 0.2 },
      dpadUp: { type: "button", index: 12 },
      dpadDown: { type: "button", index: 13 },
      dpadLeft: { type: "button", index: 14 },
      dpadRight: { type: "button", index: 15 },
      jump: { type: "button", index: 2 }, // Cross
      roll: { type: "button", index: 0 }, // Square (Dodge/Wallslide)
      danceBattle: { type: "button", index: 3 }, // Triangle (Grab)
      dance: { type: "button", index: 1 }, // Circle
      r1: { type: "button", index: 5 },
      r2: { type: "button", index: 7 },
      l1: { type: "button", index: 4 },
      l2: { type: "button", index: 6 },
      r3: { type: "button", index: 11 },
      l3: { type: "button", index: 10 },
      start: { type: "button", index: 9 },
    },
    ps_standard: {
      axisX: { type: "axis", index: 0, deadzone: 0.2 },
      axisY: { type: "axis", index: 1, deadzone: 0.2 },
      dpadUp: { type: "button", index: 12 },
      dpadDown: { type: "button", index: 13 },
      dpadLeft: { type: "button", index: 14 },
      dpadRight: { type: "button", index: 15 },
      jump: { type: "button", index: 0 }, // Cross (Bottom)
      roll: { type: "button", index: 2 }, // Square (Left)
      danceBattle: { type: "button", index: 3 }, // Triangle (Top)
      dance: { type: "button", index: 1 }, // Circle (Right)
      r1: { type: "button", index: 5 },
      r2: { type: "button", index: 7 },
      l1: { type: "button", index: 4 },
      l2: { type: "button", index: 6 },
      r3: { type: "button", index: 11 },
      l3: { type: "button", index: 10 },
      start: { type: "button", index: 9 },
    },
    xbox: {
      axisX: { type: "axis", index: 0, deadzone: 0.2 },
      axisY: { type: "axis", index: 1, deadzone: 0.2 },
      dpadUp: { type: "button", index: 12 },
      dpadDown: { type: "button", index: 13 },
      dpadLeft: { type: "button", index: 14 },
      dpadRight: { type: "button", index: 15 },
      jump: { type: "button", index: 0 }, // A (Bottom)
      roll: { type: "button", index: 2 }, // X (Left)
      danceBattle: { type: "button", index: 3 }, // Y (Top)
      dance: { type: "button", index: 1 }, // B (Right)
      r1: { type: "button", index: 5 },
      r2: { type: "button", index: 7 },
      l1: { type: "button", index: 4 },
      l2: { type: "button", index: 6 },
      r3: { type: "button", index: 11 },
      l3: { type: "button", index: 10 },
      start: { type: "button", index: 9 },
    },
    switch: {
      axisX: { type: "axis", index: 0, deadzone: 0.2 },
      axisY: { type: "axis", index: 1, deadzone: 0.2 },
      dpadUp: { type: "button", index: 12 },
      dpadDown: { type: "button", index: 13 },
      dpadLeft: { type: "button", index: 14 },
      dpadRight: { type: "button", index: 15 },
      jump: { type: "button", index: 0 }, // B (Bottom)
      roll: { type: "button", index: 2 }, // Y (Left)
      danceBattle: { type: "button", index: 3 }, // X (Top)
      dance: { type: "button", index: 1 }, // A (Right)
      r1: { type: "button", index: 5 },
      r2: { type: "button", index: 7 },
      l1: { type: "button", index: 4 },
      l2: { type: "button", index: 6 },
      r3: { type: "button", index: 11 },
      l3: { type: "button", index: 10 },
      start: { type: "button", index: 9 },
    },
  };

  DEFAULT_BINDINGS.generic = DEFAULT_BINDINGS.xbox;

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function normalizeType(controllerType) {
    if (!controllerType) return "generic";
    if (DEFAULT_BINDINGS[controllerType]) return controllerType;
    return "generic";
  }

  function createBindingsForType(controllerType) {
    const type = normalizeType(controllerType);
    return {
      controllerType: type,
      bindings: deepClone(DEFAULT_BINDINGS[type]),
    };
  }

  function mergeBindings(base, overrides) {
    const result = deepClone(base);
    if (!overrides) return result;
    Object.keys(overrides).forEach((action) => {
      if (!ACTIONS[action]) return;
      result[action] = { ...result[action], ...overrides[action] };
    });
    return result;
  }

  function getButtonLabel(controllerType, index) {
    const table = BUTTON_LABELS[controllerType] || BUTTON_LABELS.generic;
    return table?.[index] || null;
  }

  function formatBinding(controllerType, binding) {
    if (!binding) return "Unbound";
    if (binding.type === "button") {
      const label = getButtonLabel(controllerType, binding.index);
      return label
        ? `${label} (Button ${binding.index})`
        : `Button ${binding.index}`;
    }
    if (binding.type === "axis") {
      return `Axis ${binding.index}`;
    }
    return "Unbound";
  }

  function getDisplayableActions(options = {}) {
    const editableOnly = options.editableOnly ?? false;
    return ACTION_DISPLAY.filter((entry) =>
      editableOnly ? entry.editable !== false : true
    );
  }

  window.InputBindingCatalog = {
    ACTIONS,
    ACTION_DISPLAY,
    getDisplayableActions,
    DEFAULT_BINDINGS,
    createBindingsForType,
    mergeBindings,
    formatBinding,
    getButtonLabel,
  };
})();
