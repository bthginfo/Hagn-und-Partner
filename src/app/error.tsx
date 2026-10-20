'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="system-page"><div><p>Hagn & Partner</p><h1>Die Seite konnte gerade nicht geladen werden.</h1><p>Bitte versuchen Sie es erneut. Unsere Kanzlei erreichen Sie unter <a href="tel:+49841935570">0841 93557-0</a>.</p><button onClick={reset}>Erneut versuchen</button></div></main>;}
