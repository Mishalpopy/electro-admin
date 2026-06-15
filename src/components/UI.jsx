// Stat Card
export function StatCard({ label, value, icon, color = 'bg-primary', change }) {
  return (
    <div className="card flex items-center gap-3 p-4 sm:p-6 hover:border-primary/40 transition-colors">
      <div className={`${color} w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-black/20`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-400 text-xs sm:text-sm">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-white truncate">{value ?? '—'}</p>
        {change !== undefined && (
          <p className={`text-[10px] sm:text-xs mt-0.5 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change} this month
          </p>
        )}
      </div>
    </div>
  )
}

// Modal
export function Modal({ title, onClose, children, maxWidth = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px]">
      <div className={`bg-surface rounded-2xl border border-border w-full ${maxWidth} shadow-2xl animate-fade-in flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto scrollbar-none">{children}</div>
      </div>
    </div>
  )
}

// Confirm Modal
export function ConfirmModal({ title = 'Confirm Action', message, onConfirm, onCancel, loading, confirmText = 'Confirm', variant = 'danger' }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl border border-border w-full max-w-sm shadow-2xl p-6 text-center animate-fade-in">
        <div className={`w-12 h-12 ${variant === 'danger' ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {variant === 'danger' ? (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          )}
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-ghost flex-1">Cancel</button>
          <button 
            onClick={onConfirm} 
            disabled={loading} 
            className={`flex-1 ${variant === 'danger' ? 'btn-danger' : 'btn-primary'} !justify-center`}
          >
            {loading ? 'Processing…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Toast
export function Toast({ message, type = 'success', onClose }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-slide-up ${
      type === 'success'
        ? 'bg-green-900/80 border-green-600/40 text-green-300'
        : 'bg-red-900/80 border-red-600/40 text-red-300'
    }`}>
      {type === 'success'
        ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      }
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">✕</button>
    </div>
  )
}

export function Spinner({ fullPage = true }) {
  return (
    <div className={`flex items-center justify-center ${fullPage ? 'h-full min-h-[400px]' : 'py-20'} w-full`}>
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
