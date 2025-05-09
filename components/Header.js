export default function Header() {
  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-3 md:mb-0">
          Screenshot Tool
        </h1>
        <nav>
          <ul className="flex flex-wrap gap-4 md:gap-6">
            <li>
              <a href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </a>
            </li>
            <li>
              <a
                href="/ad-components"
                className="text-gray-600 hover:text-gray-900"
              >
                Ad Components
              </a>
            </li>
            <li>
              <a href="/about" className="text-gray-600 hover:text-gray-900">
                About
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
