const WPM = 225;

export const calculateReadTime = (text: string): number => {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / WPM);
};
