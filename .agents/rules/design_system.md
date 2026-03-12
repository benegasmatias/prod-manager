# Design System Rules

## UI Components & Patterns

### 1. Typography & Colors
- **Main Headers:** Use `text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50`. Use a primary-colored italic span for emphasis (e.g., `Equipo <span className="text-primary italic">de Trabajo</span>`).
- **Subheaders/Labels:** Use `text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400`. For active/primary labels, use `text-primary`.
- **Primary Color:** Use the the defined `--primary` variable (Purple).
- **Secondary Text:** Use `text-zinc-500` or `text-zinc-400` with `font-medium`.

### 2. Containers & Cards
- **Main Section Containers:** Use `rounded-[2.5rem]` for top-level sections (Stats, Filters, main Grids).
- **Cards:** Use `bg-white dark:bg-zinc-900/40 border-zinc-100 dark:border-zinc-800 shadow-sm rounded-[2.5rem]`.
- **Glassmorphism:** Apply `bg-white/70 dark:bg-zinc-900/40 backdrop-blur-sm` for search bars and top-level filters. Ensure they have subtle borders (`border-zinc-100` or `border-zinc-800/50`).
- **Inner Elements:** Use `rounded-2xl` for buttons and inputs inside cards/sections.

### 3. Tables
- **Action Visibility:** All interactive action buttons (Edit, Delete, View, etc.) MUST be always visible. Do not hide actions behind hover states (`opacity-0 group-hover:opacity-100`).
- **Headers:** Use `h-16 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400`.
- **Rows:** Consistent padding (`px-8 py-5`). Hover effect: `hover:bg-zinc-50/30 dark:hover:bg-zinc-900/40`.
- **Avatars:** User IDs or initials should use `h-12 w-12 rounded-2xl` with background colors and bold text.

### 5. Modals & Dialogs
- **Main Container:** Use `sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-white dark:bg-zinc-950`.
- **Header:** Use `p-8 border-b border-zinc-50 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/10 text-left`.
- **Icon in Header:** Use `h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary`.
- **Form Labels:** Use `text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1`.
- **Inputs:** Use `h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold transition-all focus:ring-2 focus:ring-primary/10`.
- **Dialog Footer:** Use `p-8 pt-0 flex flex-row items-center justify-end gap-3 bg-white dark:bg-zinc-950`.

### 6. Mobile Experience
- **Mobile Cards:** Use `rounded-[2.5rem]` with significant padding (`p-8`). Match desktop card styling.
- **Spacing:** Ensure items are stacked vertically with clear dividers (`border-b border-zinc-50`).
