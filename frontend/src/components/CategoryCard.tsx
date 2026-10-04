import "../styles/CategoryCard.scss";

interface CategoryCardProps {
  tone: "pink" | "green" | "purple";
  icon: string;
  title: string;
  subtitle: string;
  onClick?: () => void;
}

export default function CategoryCard({
  tone,
  icon,
  title,
  subtitle,
  onClick,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      className={`category-card tone-${tone}`}
      onClick={onClick}
    >
      <div className="category-icon">
        <i className={`fa-solid fa-${icon}`} aria-hidden="true" />
      </div>
      <div className="category-body">
        <h3 className="category-title">{title}</h3>
        <div className="category-footer">
          <p className="category-subtitle">{subtitle}</p>
          <i className="fa-solid fa-arrow-up-right category-arrow" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
}
