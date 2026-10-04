export default function EmptyState({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="glass rounded-2xl py-14 text-center animate-fadeIn">
      <div className="text-4xl" aria-hidden>{icon}</div>
      <p className="mt-3 font-semibold">{title}</p>
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}
