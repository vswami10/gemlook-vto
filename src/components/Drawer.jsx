export default function Drawer({ title, open, onClose, items, total, emptyText, children }) {
  return (
    <aside className={'drawer ' + (open ? 'open' : '')}>
      <div className="drawer-head">
        <h2>{title}</h2>
        <button className="ghost" onClick={onClose}>Close</button>
      </div>
      <div className="drawer-body">
        {items.length === 0 && <p className="muted">{emptyText}</p>}
        {items.map(item => (
          <div className="drawer-item" key={item.id}>
            <img src={item.image} alt={item.name} />
            <div><strong>{item.name}</strong><span>INR {item.price.toLocaleString('en-IN')}</span></div>
          </div>
        ))}
        {typeof total === 'number' && <div className="total">Total: INR {total.toLocaleString('en-IN')}</div>}
        {children}
      </div>
    </aside>
  );
}
