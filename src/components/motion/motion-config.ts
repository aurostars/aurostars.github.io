export const entranceEase = [0.16, 1, 0.3, 1] as const;

export function entranceTransition(delay = 0) {
  return {
    duration: 0.6,
    delay,
    ease: entranceEase,
  };
}

export const revealInitial = { opacity: 0, y: 20 };
export const revealVisible = { opacity: 1, y: 0 };
