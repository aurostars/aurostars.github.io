const links = [
  { href: "#cases", label: "案例" },
  { href: "#experience", label: "经历" },
  { href: "#contact", label: "联系" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="site-container site-nav" aria-label="主要导航">
        <a className="site-wordmark" href="#main-content">
          董星
        </a>
        <ul className="site-nav-links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
