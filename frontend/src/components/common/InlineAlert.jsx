function InlineAlert({ type = 'error', message, className = '' }) {
  if (!message) return null;

  const stylesByType = {
    error: 'bg-red-50/90 text-red-700 border-red-200',
    success: 'bg-emerald-50/90 text-emerald-700 border-emerald-200',
  };

  const toneClass = stylesByType[type] || stylesByType.error;

  return (
    <div className={`${toneClass} px-4 py-3 rounded-lg border text-sm font-medium flex items-center gap-2 ${className}`}>
      <span>{message}</span>
    </div>
  );
}

export default InlineAlert;
