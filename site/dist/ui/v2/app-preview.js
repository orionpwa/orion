export function bindStableAppPreview() {
    const root = document.documentElement;
    const stabilize = () => root.classList.add('orion-snapshot-stable');
    const resume = () => {
        window.requestAnimationFrame(() => root.classList.remove('orion-snapshot-stable'));
    };
    const onVisibility = () => document.visibilityState === 'hidden' ? stabilize() : resume();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', stabilize);
    window.addEventListener('pageshow', resume);
    return () => {
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pagehide', stabilize);
        window.removeEventListener('pageshow', resume);
    };
}
