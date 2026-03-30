const FloatingShapes = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[10%] left-[10%] w-32 h-32 rounded-full bg-gradient-to-br from-[hsl(var(--neon-violet)/0.15)] to-transparent animate-float blur-xl" />
    <div className="absolute top-[60%] right-[15%] w-40 h-40 rounded-full bg-gradient-to-br from-[hsl(var(--neon-cyan)/0.12)] to-transparent animate-float-slow blur-xl" />
    <div className="absolute bottom-[20%] left-[20%] w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(var(--neon-pink)/0.1)] to-transparent animate-float blur-xl" />
    <div className="absolute top-[30%] right-[30%] w-20 h-20 rotate-45 bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-transparent animate-float-slow blur-lg" />
    <div className="absolute bottom-[40%] left-[50%] w-16 h-16 rounded-lg rotate-12 bg-gradient-to-br from-[hsl(var(--neon-violet)/0.08)] to-transparent animate-float blur-lg" />
  </div>
);

export default FloatingShapes;
