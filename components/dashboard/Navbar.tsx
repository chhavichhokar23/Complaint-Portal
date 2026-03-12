export default function Navbar({ user }: {
  user?: {
    name?: string | null
    role?: string | null
  }
}) {
  const role = user?.role ?? ""
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  return (
    <nav className="h-14 bg-white border-b border-slate-100 px-6 flex items-center justify-between flex-shrink-0 shadow-sm">

      {/* Left — page title */}
      <div className="flex items-center gap-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          {role.charAt(0) + role.slice(1).toLowerCase()} Dashboard
        </p>
      </div>

      {/* Right — avatar with name */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-700 leading-tight">{user?.name || "User"}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
          <span className="text-white text-xs font-semibold">{initials}</span>
        </div>
      </div>

    </nav>
  )
}