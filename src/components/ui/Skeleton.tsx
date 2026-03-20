export default function Skeleton({ className = '', count = 1 }: { className?: string; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-shimmer rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 ${className}`}
        />
      ))}
    </>
  );
}
