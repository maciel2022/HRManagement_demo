import { useTheme } from '@/context/ThemeContext';
import { Icon } from './primitives';

export function ThemeToggle({ className = '' }) {
  const { esOscuro, alternarTema } = useTheme();
  const destino = esOscuro ? 'claro' : 'oscuro';
  return (
    <button
      onClick={alternarTema}
      aria-label={'Cambiar a tema ' + destino}
      aria-pressed={esOscuro}
      title={'Tema ' + destino}
      className={
        'w-[38px] h-[38px] shrink-0 border border-linestrong rounded-[10px] bg-surface hover:bg-surface2 grid place-items-center ' +
        className
      }
    >
      <Icon name={esOscuro ? 'light_mode' : 'dark_mode'} size={20} className="text-ink2" />
    </button>
  );
}
