import Link from "next/link";

export default function FooterList({ title, items }) {
  return (
    <div>
      <h4 className="font-semibold mb-4">{title}</h4>

      <ul className="space-y-2 text-sm">
        {items.map((item, i) => (
          <li key={i}>
            {item.href ? (
              <Link
                href={item.href}
                className="
                 footer-link-underline
                "
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-white">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
