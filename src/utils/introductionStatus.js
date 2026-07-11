export const INTRODUCTION_STATUS_SEQUENCE = [
  'introduction',
  'appointment',
  'pending',
  'completed',
];

export const getNextIntroductionStatus = status => {
  const currentIndex = INTRODUCTION_STATUS_SEQUENCE.indexOf(status);

  if (
    currentIndex < 0 ||
    currentIndex === INTRODUCTION_STATUS_SEQUENCE.length - 1
  ) {
    return null;
  }

  return INTRODUCTION_STATUS_SEQUENCE[currentIndex + 1];
};

export const formatIntroductionStatus = status => {
  if (!status) {
    return 'Not available';
  }

  const normalized = status
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ');

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};
