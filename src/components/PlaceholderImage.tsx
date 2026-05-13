'use client';

interface PlaceholderImageProps {
  category: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const categoryConfig: Record<string, {
  gradient: string;
  pattern: string;
  icon: string;
  accent: string;
  decorations: string[];
}> = {
  clothing: {
    gradient: 'from-rose-100 via-pink-50 to-rose-200',
    pattern: 'radial-gradient(circle at 20% 80%, rgba(190,24,93,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(244,63,94,0.1) 0%, transparent 50%)',
    icon: '👘',
    accent: '#be185d',
    decorations: ['✿', '❀', '✾'],
  },
  jewelry: {
    gradient: 'from-amber-100 via-yellow-50 to-amber-200',
    pattern: 'radial-gradient(circle at 30% 70%, rgba(217,119,6,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(245,158,11,0.08) 0%, transparent 50%)',
    icon: '💍',
    accent: '#b45309',
    decorations: ['◇', '◆', '✧'],
  },
  art: {
    gradient: 'from-violet-100 via-purple-50 to-indigo-200',
    pattern: 'radial-gradient(circle at 25% 75%, rgba(124,58,237,0.08) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(99,102,241,0.1) 0%, transparent 50%)',
    icon: '🎨',
    accent: '#7c3aed',
    decorations: ['◐', '◑', '◒'],
  },
  crafts: {
    gradient: 'from-emerald-100 via-green-50 to-teal-200',
    pattern: 'radial-gradient(circle at 20% 80%, rgba(5,150,105,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(20,184,166,0.1) 0%, transparent 50%)',
    icon: '🧶',
    accent: '#059669',
    decorations: ['❋', '✤', '❊'],
  },
  home: {
    gradient: 'from-sky-100 via-blue-50 to-cyan-200',
    pattern: 'radial-gradient(circle at 30% 70%, rgba(2,132,199,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(6,182,212,0.1) 0%, transparent 50%)',
    icon: '🏠',
    accent: '#0284c7',
    decorations: ['▣', '▤', '▥'],
  },
  food: {
    gradient: 'from-orange-100 via-amber-50 to-orange-200',
    pattern: 'radial-gradient(circle at 25% 75%, rgba(234,88,12,0.08) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(251,146,60,0.1) 0%, transparent 50%)',
    icon: '🥩',
    accent: '#ea580c',
    decorations: ['◉', '◎', '○'],
  },
  instruments: {
    gradient: 'from-red-100 via-rose-50 to-red-200',
    pattern: 'radial-gradient(circle at 20% 80%, rgba(185,28,28,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239,68,68,0.1) 0%, transparent 50%)',
    icon: '🎻',
    accent: '#b91c1c',
    decorations: ['♪', '♫', '♬'],
  },
  books: {
    gradient: 'from-slate-100 via-gray-50 to-slate-200',
    pattern: 'radial-gradient(circle at 30% 70%, rgba(71,85,105,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(100,116,139,0.1) 0%, transparent 50%)',
    icon: '📚',
    accent: '#475569',
    decorations: ['❝', '❞', '¶'],
  },
};

const productIcons: Record<string, string> = {
  'p1': '👘',   // Дээл
  'p2': '📿',   // Бугуйвч
  'p3': '🖼️',  // Зураг
  'p4': '🥾',   // Эсгий гутал
  'p5': '🎻',   // Морин хуур
  'p6': '🪢',   // Хивс
  'p7': '📖',   // Ном
  'p8': '🎩',   // Малгай
  'p9': '💎',   // Зүүлт
  'p10': '🪵',  // Модон тэрэг
  'p11': '🧀',  // Аарц
  'p12': '🖋️', // Уран бичлэг
};

export default function PlaceholderImage({ category, name, size = 'md', className = '' }: PlaceholderImageProps) {
  const config = categoryConfig[category] || categoryConfig.crafts;
  const iconSize = size === 'lg' ? 'text-8xl' : size === 'md' ? 'text-6xl' : 'text-4xl';
  const decoSize = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm';

  // Find product-specific icon from name hash
  const productIcon = Object.entries(productIcons).find(([_, icon]) => {
    return name.includes('дээл') || name.includes('Дээл') ? icon === '👘' :
      name.includes('бугуйвч') || name.includes('Бугуйвч') ? icon === '📿' :
      name.includes('зураг') || name.includes('Зураг') || name.includes('Хустай') ? icon === '🖼️' :
      name.includes('гутал') || name.includes('Гутал') ? icon === '🥾' :
      name.includes('хуур') || name.includes('Хуур') ? icon === '🎻' :
      name.includes('хивс') || name.includes('Хивс') ? icon === '🪢' :
      name.includes('ном') || name.includes('товчоо') ? icon === '📖' :
      name.includes('малгай') || name.includes('Малгай') ? icon === '🎩' :
      name.includes('зүүлт') || name.includes('Зүүлт') ? icon === '💎' :
      name.includes('тэрэг') || name.includes('Тэрэг') || name.includes('Модон') ? icon === '🪵' :
      name.includes('аарц') || name.includes('Аарц') ? icon === '🧀' :
      name.includes('бичлэг') || name.includes('Бичлэг') || name.includes('бичээс') ? icon === '🖋️' :
      false;
  });

  const displayIcon = productIcon ? productIcon[1] : config.icon;

  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${config.gradient} overflow-hidden ${className}`}>
      {/* Background pattern */}
      <div className="absolute inset-0" style={{ backgroundImage: config.pattern }} />

      {/* Mongolian-style border decoration */}
      <div className="absolute inset-0">
        {/* Top border pattern */}
        <div className="absolute top-0 left-0 right-0 h-2" style={{
          background: `repeating-linear-gradient(90deg, ${config.accent}22 0px, ${config.accent}22 8px, transparent 8px, transparent 16px)`
        }} />
        {/* Bottom border pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-2" style={{
          background: `repeating-linear-gradient(90deg, ${config.accent}22 0px, ${config.accent}22 8px, transparent 8px, transparent 16px)`
        }} />
      </div>

      {/* Corner decorations */}
      <div className={`absolute top-3 left-3 ${decoSize} opacity-20`} style={{ color: config.accent }}>
        {config.decorations[0]}
      </div>
      <div className={`absolute top-3 right-3 ${decoSize} opacity-20`} style={{ color: config.accent }}>
        {config.decorations[1]}
      </div>
      <div className={`absolute bottom-3 left-3 ${decoSize} opacity-20`} style={{ color: config.accent }}>
        {config.decorations[2]}
      </div>
      <div className={`absolute bottom-3 right-3 ${decoSize} opacity-20`} style={{ color: config.accent }}>
        {config.decorations[0]}
      </div>

      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/6 w-20 h-20 rounded-full opacity-[0.07]" style={{ background: config.accent }} />
      <div className="absolute bottom-1/4 right-1/6 w-16 h-16 rounded-full opacity-[0.05]" style={{ background: config.accent }} />

      {/* Main icon */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`${iconSize} drop-shadow-sm mb-1`} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
          {displayIcon}
        </div>
        {size !== 'sm' && (
          <div
            className="text-xs font-medium px-3 py-1 rounded-full mt-2 max-w-[80%] text-center truncate opacity-60"
            style={{ color: config.accent, backgroundColor: `${config.accent}10` }}
          >
            {name.length > 25 ? name.substring(0, 25) + '...' : name}
          </div>
        )}
      </div>

      {/* Subtle inner shadow for depth */}
      <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.03)]" />
    </div>
  );
}
