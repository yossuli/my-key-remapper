interface ShowProps {
  condition: boolean;
  children: React.ReactNode;
}

export const Show = ({ condition, children }: ShowProps) =>
  condition ? children : null;
