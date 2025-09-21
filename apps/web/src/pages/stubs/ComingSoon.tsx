export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="opacity-80">Coming soon — this module will be implemented next.</p>
    </div>
  );
}
