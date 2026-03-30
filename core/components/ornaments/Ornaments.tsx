export const OrnamentWavesTop = () => (
  <svg
    viewBox="0 0 1440 120"
    className="w-full h-auto"
    preserveAspectRatio="none"
  >
    <path
      d="M0,40 C200,120 400,0 720,80 C1040,160 1240,60 1440,100 L1440,0 L0,0 Z"
      fill="#FAF3E0"
    />
  </svg>
);

export const OrnamentWavesBottom = () => (
  <svg
    viewBox="0 0 1440 120"
    className="w-full h-auto rotate-180"
    preserveAspectRatio="none"
  >
    <path
      d="M0,40 C200,120 400,0 720,80 C1040,160 1240,60 1440,100 L1440,0 L0,0 Z"
      fill="#FAF3E0"
    />
  </svg>
);

export const OrnamentDrops = () => (
  <svg width="160" height="160" className="opacity-40">
    <g fill="#6B3E26">
      <circle cx="40" cy="40" r="12" />
      <circle cx="80" cy="30" r="8" />
      <circle cx="120" cy="50" r="10" />
      <circle cx="60" cy="80" r="14" />
      <circle cx="100" cy="110" r="20" />
    </g>
  </svg>
);

export const OrnamentPetals = () => (
  <svg width="180" height="180" className="opacity-30">
    <g fill="#DA6C94">
      <ellipse cx="90" cy="30" rx="20" ry="40" />
      <ellipse cx="150" cy="90" rx="20" ry="40" />
      <ellipse cx="90" cy="150" rx="20" ry="40" />
      <ellipse cx="30" cy="90" rx="20" ry="40" />
    </g>
  </svg>
);
