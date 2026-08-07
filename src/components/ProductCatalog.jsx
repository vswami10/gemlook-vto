import { catalog } from '../services/catalog.js';

export default function ProductCatalog({ selectedEarring, selectedNecklace, onTry, onCart, onWish }) {
  const groups = {
    earrings: catalog.filter(p => p.category === 'earrings'),
    necklace: catalog.filter(p => p.category === 'necklace')
  };
  return (
    <section className="panel catalog-panel">
      <div className="panel-title">Product Catalog</div>
      {Object.entries(groups).map(([category, products]) => (
        <div key={category} className="catalog-group">
          <h3>{category === 'earrings' ? 'Earrings' : 'Necklace'}</h3>
          <div className="product-grid">
            {products.map(product => {
              const active = product.id === selectedEarring || product.id === selectedNecklace;
              return (
                <article className={'product-card ' + (active ? 'active' : '')} key={product.id}>
                  <img src={product.image} alt={product.name} />
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">INR {product.price.toLocaleString('en-IN')}</div>
                  <div className="product-actions">
                    <button onClick={() => onTry(product)}>Try on</button>
                    <button onClick={() => onWish(product)}>Wish</button>
                    <button onClick={() => onCart(product)}>Cart</button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
