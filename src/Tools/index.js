
const modules = import.meta.glob('./*.jsx', { eager: true });

export const maidasTools = Object.values(modules).map(mod => mod.default).filter(Boolean);     